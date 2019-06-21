var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fq = require("fuzzquire");
var cgTranscriptsModel = fq("schemas/cgTranscripts");

router.get("/", function(req, res, next) {
  var filters = {};
  var sort = {};
  console.log(req.query.hideCompleted);
  if (req.query.hideCompleted) {
    filters["status"] = {
      $not: /Completed/
    };
  }

  if (req.query.sort) {
    if (req.query.sort == "old") {
      sort["date"] = 1;
    } else if (req.query.sort == "new") {
      sort["date"] = -1;
    } else if (req.query.sort == "status") {
      sort["status"] == -1;
    }
  }

  cgTranscriptsModel
    .find(filters)
    .sort(sort)
    .exec(function(err, cgTranscripts) {
      if (err) {
        res.renderState("/error", {
          title: "Cant connect to database",
          subtitle: "Data could not be loaded",
          message: "Please try later",
          error: {
            status: "500",
            stack: err
          }
        });
        console.log(err);
      } else {
        res.renderState("admin/portals/cg-transcripts", {
          cgTranscripts: cgTranscripts,
          message: req.query.message,
          hideCompleted: req.query.hideCompleted,
          sort: req.query.sort
        });
      }
    });
});

router.post("/modify-status", function(req, res) {
  cgTranscriptsModel.findById(req.body.applicationId, function(
    err,
    transcript
  ) {
    if (err) {
      res.json({
        message: "Error, failed to save data",
        error: err
      });
    } else {
      transcript.status = req.body.status;
      transcript.info = req.body.info;
      transcript.save(function(err, transcript) {
        if (err) {
          res.json({
            message: "Error, failed to save data",
            error: err
          });
        } else {
          res.redirect(
            "../cg-transcripts?message=Updated Document Successfully"
          );
        }
      });
    }
  });
});

module.exports = router;
