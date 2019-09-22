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

module.exports = router;
