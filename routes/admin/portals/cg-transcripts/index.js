var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var fq = require("fuzzquire");
var cgTranscriptsModel = fq("schemas/cgTranscripts");

router.get("/", function (req, res, next) {
  cgTranscriptsModel.find(function (err, cgTranscripts) {
    if (err) {
      res.renderState("/error", {
        title: "Cant connect to database", subtitle: "Data could not be loaded", message: "Please try later", error: {
          status: "500",
          stack: err
        }
      });

    } else {
      res.renderState("admin/portals/cg-transcripts", { cgTranscripts: cgTranscripts });
    }
  })
});


module.exports = router;
