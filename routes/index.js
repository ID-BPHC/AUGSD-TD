var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
var path = require("path");

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

router.get("/fd-thesis", (req, res, next) => {
  res.render("fd-thesis");
});

var forms = [
  "Off-Campus-Form-A",
  "Off-Campus-Form-B",
  "Pre-allotment-Guidelines"
];

forms.forEach(form => {
  router.get("/" + form, (req, res, next) => {
    res.sendFile(
      path.join(__dirname + "./../public/AUGSD/fd-thesis/" + form + ".pdf")
    );
  });
});

module.exports = router;
