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
var cgTranscriptUsersModel = require("../../../schemas/cgTransctipt-users.js");

let authenticate = function (req, res, next) {
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

let checkErrors = function (req, res, next) {
  if (errorFields.length > 0) {
    res.status(400).json({
      error: true,
      message: `Invalid fields ${errorFields}`
    });
    return true;
  }
  return false;
};

router.all("/", function (req, res, next) {
  errorFields = []; // The error fields must be reset for every query
  next();
});

router.get("/test", authenticate, function (req, res) {
  res.json({ message: "API is online." });
});

router.post("/", authenticate, function (req, res, next) {
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
    cgtranscript.save(function (err) {
      if (err) {
        res.json({
          error: true,
          message: `Could not save to database because of this error : ${error}`
        }); gi
      } else {
        res.status(201).json({
          message: "Successfully Saved Request"
        });
      }
    });
  }
});

router.get("/", authenticate, function (req, res, next) {
  if (!req.query.email) {
    cgTranscriptsModel.find(function (err, cgtranscript) {
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
        email: req.query.email
      },
      function (err, cgtranscript) {
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

router.post("/users", authenticate, function (req, res) {

  if (req.body.email) {
    cgTranscriptUsersModel.findOne({
      email: req.body.email
    }, function (err, user) {
      if (err) {
        res.status(500).json({
          error: err
        })
      } else {
        if (user) {
          if (req.body.name) {
            user.name = req.body.name
          } if (req.body.bitsId) {
            user.bitsId = req.body.bitsId
          } if (req.body.address) {
            user.address = req.body.address
          } if (req.body.mcode) {
            user.mcode = req.body.mcode
          }
          user.save(function (err, user) {
            if (err) {
              res.status(500).json({
                error: err
              })
            } else {
              res.json(user)
            }
          })
        } else {

          errorFields = [];
          if (!req.body.email) {
            errorFields.push("email")
          };
          if (!req.body.name) {
            errorFields.push("name")
          };
          if (!req.body.bitsId) {
            errorFields.push("bitsId")
          };
          if (!req.body.mcode) {
            errorFields.push("mcode")
          };
          if (!req.body.address) {
            errorFields.push("address")
          };
          if (errorFields.length > 0) {
            res.status(500).json({
              error: `Required fields : ${errorFields}`,
            })
          } else {
            var user = new cgTranscriptUsersModel();
            user.name = req.body.name;
            user.email = req.body.email;
            user.address = req.body.address;
            user.mcode = req.body.mcode;
            user.bits = req.body.bitsId;
            user.save(function (err, cgTranscriptUser) {
              if (err) {
                res.json(err);
              } else {
                res.json(cgTranscriptUser);
              }
            })
          }
        }
      }
    })
  }


});


router.get("/users", authenticate, function (req, res) {

  if (req.query.email) {
    cgTranscriptUsersModel.findOne({
      email: req.query.email
    }, function (err, user) {
      if (err) {
        res.status(500).json({
          error: err
        })
      } else {
        res.json(user)
      }
    })
  } else {
    cgTranscriptUsersModel.find(function (err, user) {
      if (err) {
        res.status(500).json({
          error: err,
        })
      } else {
        res.json(user)
      }
    })
  }
});
module.exports = router;
