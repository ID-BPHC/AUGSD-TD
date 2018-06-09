var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks");
var adminsModel = fq("schemas/admins");

router.get("/", function(req, res, next) {
  try {
    feedbacksModel.find({ type: "midsem" }, (err, feedbacks) => {
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
          res.renderState("admin/portals/feedbacks-admin/midsem/index", {
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

router.get("/view/:id", function(req, res, next) {
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
              type: "midsem"
            },
            (err, feedbacks) => {
              if (err) {
                return res.terminate(err);
              }

              res.renderState("admin/portals/feedbacks-admin/midsem/view", {
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
