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
  res.render("team", {
    users: users[config.siteMode],
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
