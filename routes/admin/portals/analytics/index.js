var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var path = require("path");
const fileUpload = require('express-fileupload');
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
const csv = require('csv-parser')
const fs = require('fs')
//let appRoot = require("app-root-path");
let studentAcademics = fq("schemas/student-academics");

const { check, validationResult } = require("express-validator/check");
router.use(fileUpload());

router.get("/", function (req, res, next) {
  var adminsModel = fq("schemas/admins");
  var isAdmin = [];
  const adminQuery = adminsModel.findOne({email: req.user.email});
  if(adminQuery) isAdmin = [1];
  //const studentData = studentAcademics.find({raEmail: req.user.email}, {bitsatScore:1, idNo:1, studentName:1, erpId:1, cgs:1, _id:0}).toArray;
  const studentData = studentAcademics.find({raEmail: req.user.email}, {bitsatScore:1, semesters: 1, idNo:1, studentName:1, erpId:1, cgs:1, _id:0}).then(studentData => {
    const data = {x: [], y: [], isAdmin: isAdmin};
    var params = {}
    params.studentData = studentData;
    params.data = data;
    res.renderState("admin/portals/analytics", params);
  });
});
router.post("/", function (req, res, next) {
  const studentId = req.body.studentForm[0];
  studentAcademics.findOne({ idNo: studentId }).then(student => {
    var y = student.cgs;
    var semesters = student.semesters;
    for (let i = 0; i < y.length; i++) {
      if(y[i] == null) {
        y.splice(i, 1);
        semesters.splice(i, 1);
      }
    }
    var x = Array.from({ length: y.length }, (v, k) => k + 1);
    const data = {x: x, y: y, x_labels: semesters};
    const info = {name: [student.studentName], idNo: [studentId], bitsatScore: [student.bitsatScore]}
    res.renderState("admin/portals/analytics", { data: JSON.stringify(data), info: info });
  }).catch((err) => {
    console.log(err);
    res.renderState("custom_errors", {
    redirect: "/admin/analytics",
    timeout: 2,
    supertitle: "Non existent ID",
    message: "Student ID " + studentId + " doesn't exist",
    details: err
  });});
})
router.get("/upload", function (req, res) {
  res.renderState("admin/portals/analytics/upload");
});
router.post("/upload", function (req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  let file = req.files.studentData
  file.mv('public/students-academics.csv', function (err) {
    if (err)
      return res.status(500).send(err);
  })
  const results = [];
  fs.createReadStream('public/students-academics.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      var sampleData = results[0];
      var cgKey = Object.keys(sampleData).indexOf("RA") + 1;
      for (row of results) {
        var erpID = row['Emp ID'];
        var studentID = row['ID No.'];
        var studentName = row['Student Name'];
        var discipline = row.Discipline;
        var bitsatScore = row['BITSAT Score'];
        var raEmail = row['RA'];
        var semesters = [];
        var cgs = [];
        
        Object.keys(row).slice(cgKey).forEach(function (key) {
          semesters.push(key.toString());
          cgs.push(row[key]);
        });
        studentAcademics.create(
          {erpId: erpID, idNo: studentID, studentName: studentName, discipline: discipline, bitsatScore: bitsatScore, raEmail: raEmail, semesters: semesters, cgs: cgs},
          function (err, studentAcademicInstance) {
            if (err) {
              console.log("Error creating model " + err);
              return res.renderState("custom_errors", {
                redirect: "/admin/analytics",
                timeout: 2,
                supertitle: "Error",
                message: "Error in uploading data to the database. \n Contact developer...",
                details: err
              });
            }
          }
        )
      }
    });
    res.renderState("custom_errors", {
      redirect: "/admin/analytics",
      timeout: 2,
      supertitle: "Finished uploading",
      message: "Successfully uploaded data to the database. \n Redirecting...",
      details: " "
    });
});

module.exports = router;
