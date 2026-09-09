var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
var path = require("path");
var fs = require("fs");
let appRoot = require("app-root-path");

router.get("/", function(req, res, next) {
  res.render("index");
});
router.get("/team", function(req, res, next) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  var portalUsers = users[config.siteMode] || users.TD;
  var students = portalUsers.students || {};
  res.render("team", {
    users: {
      staff: Object.keys(portalUsers.staff || {}).map(function(name) {
        return portalUsers.staff[name];
      }),
      students: {
        coordinator: Object.keys(students.coordinator || {}).map(function(name) {
          return students.coordinator[name];
        }),
        members: Object.keys(students.members || {}).map(function(name) {
          return students.members[name];
        })
      }
    },
    column: 3,
    totalModules: 17
  });
});
router.get("/type", function(req, res, next) {
  res.render("type");
});

router.get("/fd-thesis", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/fd-thesis", function(err, files) {
    res.render("fd-thesis", { forms: files });
  });
});
router.get("/academic-records", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/academic-records", function(err, files) {
    res.render("academic-records", { forms: files });
  });
});
router.get("/reg-grad", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/reg-grad", function(err, files) {
    res.render("reg-grad", { forms: files });
  });
});
router.get("/registration", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/registration", function(err, files) {
    res.render("registration", { forms: files });
  });
});
module.exports = router;
