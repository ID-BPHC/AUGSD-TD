var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
var fs = require("fs");
let appRoot = require("app-root-path");
let bugsModel = fq("schemas/bugs");
const { check, validationResult } = require("express-validator/check");

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

router.get(/^\/(admin|dashboard)\/bug$/, function(req, res, next) {
  let params = {};
  params.categories = [
    "User Interface",
    "Feature Request",
    "Site Performance",
    "Site Operationality",
    "Thank You"
  ];
  res.renderState("bug", params);
});

router.post(
  /^\/(admin|dashboard)\/bug$/,
  [
    check("feedbacklist")
      .exists()
      .withMessage("No Category is specified")
      .not()
      .equals(". . .") // default value in the category selector
      .withMessage("No Category is specified"),
    check("feedback")
      .exists()
      .withMessage("Feedback is left empty")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Feedback is left empty")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("custom_errors", {
        redirect: "/" + req.originalUrl.split("/")[1] + "/bug",
        timeout: 2,
        supertitle: "Invalid Details",
        message: "Bug report Failed",
        details: errors.array().map(e => e.msg)
      });
    }

    let dataStore = {
      category: req.sanitize(req.body.feedbacklist),
      report: req.sanitize(req.body.feedback),
      useragent: req.sanitize(req.headers["user-agent"]),
      user: req.user.email
    };
    bugsModel.create(dataStore, function(err, response) {
      if (err) {
        res.renderState("custom_errors", {
          redirect: "/" + req.originalUrl.split("/")[1] + "/bug",
          timeout: 2,
          supertitle: "Failed submitting feedback.",
          message: "Failed",
          details: err
        });
      }
      res.renderState("custom_errors", {
        redirect: "/" + req.originalUrl.split("/")[1],
        timeout: 2,
        supertitle: "Submitted Report.",
        message: "Success",
        details: "Report has been submitted"
      });
    });
  }
);

router.get(/^\/(admin|dashboard)\/bug\/policy$/, function(req, res, next) {
  res.renderState("bug_policy");
});

router.get("/fd-thesis", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/fd-thesis", function(err, files) {
    res.render("fd-thesis", { forms: files });
  });
});
module.exports = router;
