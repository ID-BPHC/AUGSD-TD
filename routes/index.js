let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let users = fq("users");
let config = fq("config");
let fs = require("fs");
let appRoot = require("app-root-path");

router.get("/", function(req, res, next) {
  res.render("index");
});

router.get(["/team", "/contact"], function(req, res, next) {
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

module.exports = router;
