var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks");
var adminsModel = fq("schemas/admins");
const dump = require("./export.js");

["/export/24x7", "/export/midsem"].forEach(exportType => {
  router.use(exportType, dump);
});

["24x7", "midsem"].forEach(fb_type => {
  router.get("/" + fb_type, function(req, res, next) {
    try {
      feedbacksModel.find({ type: fb_type }, (err, feedbacks) => {
        if (err) {
          return res.terminate(err);
        }
        adminsModel.find(
          {
            superUser: false
          },
          {
            __v: 1,
            name: 1,
            email: 1
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

            feedbacks.forEach((object, index, array) => {
              result.forEach((obj, ind, arr) => {
                if (arr[ind].email == array[index].instructor) {
                  array[index].name = arr[ind].name;
                }
              });
              array[index].createdOn = getUTCDate(
                Number(array[index].createdOn)
              );
            });

            res.renderState("admin/portals/feedbacks-admin/" + fb_type, {
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
});

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/feedbacks");
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
  return date.toLocaleString("en-US", { timeZone: "UTC" });
}

["24x7", "midsem"].forEach(fb_type => {
  router.get("/" + fb_type + "/view/:id", function(req, res, next) {
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
                type: fb_type
              },
              (err, feedbacks) => {
                if (err) {
                  return res.terminate(err);
                }

                feedbacks.forEach((object, index, array) => {
                  array[index].createdOn = getUTCDate(
                    Number(array[index].createdOn)
                  );
                });

                res.renderState(
                  "admin/portals/feedbacks-admin/" + fb_type + "/view",
                  {
                    results: {
                      id: result._id,
                      name: result.name,
                      email: result.email,
                      feedback: feedbacks
                    }
                  }
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.terminate(err);
    }
  });
});

module.exports = router;
