var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
var path = require("path");
var fs = require("fs");
let appRoot = require("app-root-path");
var errorFields = [];
var cgTranscriptsModel = require("../../../schemas/cgTranscripts");

let authenticate = function(req, res, next) {
  if (true) {
    return next();
  } else {
    res.status(401).json({
      error: true,
      message: "Uable to authenticate"
    });
    return;
  }
};

let checkErrors = function(req, res, next) {
  if (errorFields.length > 0) {
    res.status(400).json({
      error: true,
      message: `Invalid fields ${errorFields}`
    });
    return true;
  }
  return false;
};

router.all("/", function(req, res, next) {
  errorFields = []; // The error fields must be reset for every query
  next();
});

router.get("/test", authenticate, function(req, res) {
  res.json({ message: "API is online." });
});

router.post("/", authenticate, function(req, res, next) {
  if (!req.body.bitsId) {
    errorFields.push("bitsId");
  }
  if (!req.body.email) {
    errorFields.push("email");
  }
  if (!req.body.applicationType) {
    errorFields.push("applicationType");
  }
  if (!checkErrors(req, res, next)) {
    var cgtranscript = new cgTranscriptsModel({
      bitsId: req.body.bitsId.toUpperCase(),
      date: Date.now(),
      email: req.body.email,
      applicationType: req.body.applicationType.toUpperCase(),
      status: "A",
      email: req.body.email
    });
    cgtranscript.save(function(err) {
      if (err) {
        res.json({
          error: true,
          message: `Could not save to database because of this error : ${error}`
        });
      } else {
        res.status(201).json({
          message: "Successfully Saved Request"
        });
      }
    });
  }
});

router.get("/", authenticate, function(req, res, next) {
  if (!req.body.email) {
    cgTranscriptsModel.find(function(err, cgtranscript) {
      if (err) {
        res.status(500).json({
          error: true,
          message: `Error in database query : ${err}`
        });
      } else {
        res.json(cgtranscript);
      }
    });
  } else {
    cgTranscriptsModel.find(
      {
        email: req.body.email
      },
      function(err, cgtranscript) {
        if (err) {
          res.status(500).json({
            error: true,
            message: `Error : ${err}`
          });
        } else {
          res.json(cgtranscript);
        }
      }
    );
  }
});

module.exports = router;
