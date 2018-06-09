//24x7 feedback

var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks");
var adminsModel = fq("schemas/admins");
var midsem = require("./midsem/index");

router.use("/midsem", midsem);

router.get("/24x7", function(req, res, next) {
  try {
    feedbacksModel.find({ type: "24x7" }, (err, feedbacks) => {
      if (err) {
        return res.terminate(err);
      }
      adminsModel.find(
        {
          superUser: false
        },
        {
          __v: 1,
          name: 1
        },
        {
          sort: {
            name: 1
          }
        },
        (err, result) => {
          if (err) {
            return res.terminate(err);
          }
          res.renderState("admin/portals/feedbacks-admin/24x7", {
            profs: result,
            results: {
              feedbacks: feedbacks
            }
          });
        }
      );
    });
  } catch (err) {
    return res.terminate(err);
  }
});

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/feedbacks-admin");
});

function getUTCDate(epoch) {
  let utcDate = new Date(epoch);
  let date = new Date();
  date.setUTCDate(utcDate.getDate());
  date.setUTCHours(utcDate.getHours());
  date.setUTCMonth(utcDate.getMonth());
  date.setUTCMinutes(utcDate.getMinutes());
  date.setUTCSeconds(utcDate.getSeconds());
  date.setUTCMilliseconds(utcDate.getMilliseconds());
  return date.toLocaleDateString("en-US");
}

router.get("/24x7/view/:id", function(req, res, next) {
  try {
    adminsModel.findOne(
      {
        _id: req.sanitize(req.params.id)
      },
      {
        name: 1,
        email: 1
      },
      (err, result) => {
        if (err) {
          return res.terminate(err);
        }
        if (result != null && result != undefined) {
          feedbacksModel.find(
            {
              instructor: result.email,
              type: "24x7"
            },
            (err, feedbacks) => {
              if (err) {
                return res.terminate(err);
              }
              res.renderState("admin/portals/feedbacks-admin/24x7/view", {
                results: {
                  id: result._id,
                  name: result.name,
                  email: result.email,
                  feedback: feedbacks
                }
              });
            }
          );
        }
      }
    );
  } catch (err) {
    return res.terminate(err);
  }
});

module.exports = router;
