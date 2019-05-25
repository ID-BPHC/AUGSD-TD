var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fq = require("fuzzquire");
var users = fq("users");
var config = fq("config");
var path = require("path");
var fs = require("fs");
let appRoot = require("app-root-path");
var cgTranscriptsModel = require("../schemas/cgTranscripts");

let verifyKey = function(key) {
  if (key == "test-key") {
    return true;
  }
  return false;
};

router.post("/create-application", function(req, res, next) {
  if (!verifyKey(req.body.key)) {
    res.json({
      response: 0,
      message: "Invalid key"
    });
    return;
  }
  var errorFields = [];
  if (!req.body.bitsId) {
    errorFields.push("bitsId");
  }
  if (!req.body.email) {
    errorFields.push("email");
  }
  if (!req.body.applicationType) {
    errorFields.push("applicationType");
  }
  if (errorFields.length > 0) {
    res.json({
      response: 1,
      message: JSON.stringify(errorFields)
    });
  } else {
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
          response: 1,
          message: `Could not save to database because of this error : ${error}`
        });
      } else {
        res.json({
          response: 0,
          message: "Successfully Saved"
        });
      }
    });
  }
});

router.post("/get-application", function(req, res) {
  var errorFields = [];
  if (!verifyKey(req.body.key)) {
    res.json({
      response: 0,
      message: "Invalid key"
    });
    return;
  }
  if (!req.body.email) {
    errorFields.push("email");
  }
  if (errorFields.length > 0) {
    res.json({
      response: 1,
      message: `Invalid fields : ${errorFields}`
    });
  } else {
    cgTranscriptsModel.findOne(
      {
        email: req.body.email
      },
      function(err, cgtranscript) {
        if (err) {
          res.json({
            response: 0,
            message: `Error : ${err}`
          });
        } else {
          if (!cgtranscript) {
            res.json({
              response: 0,
              message: `No record found`
            });
          } else {
            res.json(cgtranscript);
          }
        }
      }
    );
  }
});

router.post("/get-all-applications", function(req, res) {
  if (!verifyKey(req.body.key)) {
    res.json({
      response: 0,
      message: "Invalid key"
    });
    return;
  }
  if (req.body.email) {
    cgTranscriptsModel.find(
      {
        email: req.body.email
      },
      function(err, cgtranscripts) {
        if (err) {
          res.json({
            response: 0,
            message: `Error : ${err}`
          });
        } else {
          if (!cgtranscripts) {
            res.json({
              response: 0,
              message: `No records found`
            });
          } else {
            res.json(cgtranscripts);
          }
        }
      }
    );
  } else {
    res.json({
      response: 0,
      message: "Inalid field: email"
    });
  }
});

router.get("/get-all-applications", function(req, res) {
  if (!verifyKey(req.body.key)) {
    res.json({
      response: 0,
      message: "Invalid key"
    });
    return;
  }
  cgTranscriptsModel.find({}, function(err, cgtranscripts) {
    if (err) {
      res.json({
        response: 0,
        message: `Error : ${err}`
      });
    } else {
      if (!cgtranscripts) {
        res.json({
          response: 0,
          message: `No records found`
        });
      } else {
        res.json(cgtranscripts);
      }
    }
  });
});

module.exports = router;
