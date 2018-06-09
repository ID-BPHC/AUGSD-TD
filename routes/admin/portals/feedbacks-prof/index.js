//24x7 feedback

var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks");
var adminsModel = fq("schemas/admins");

router.get("/", function(req, res, next) {
  try {
    feedbacksModel.find(
      {
        instructor: req.user.email,
        type: "24x7"
      },
      {
        __v: 0
      },
      {
        sort: {
          createdOn: -1
        }
      },
      (err, result) => {
        if (err) {
          return res.terminate(err);
        }
        result.forEach((object, index, array) => {
          array[index].createdOn = getUTCDate(Number(array[index].createdOn));
        });
        res.renderState("admin/portals/feedbacks-prof", {
          feedbacks: result
        });
      }
    );
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
  return date.toLocaleString("en-US", { timeZone: "UTC" });
}

module.exports = router;
