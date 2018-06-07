var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks-midsem");
var adminsModel = fq("schemas/admins");

router.get("/", function(req, res, next) {
  try {
    feedbacksModel.find(
      {
        instructor: req.user.email
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
          for (i = 0; i < 3; i++)
            array[index].responses[i] =
              array[index].responses[i].substring(
                0,
                Math.min(array[index].responses[i].length, 66)
              ) + " ...";
        });
        res.renderState("admin/portals/feedbacks-prof/midsem", {
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
  return date.toLocaleDateString("en-US");
}

router.get("/midsem/view/:id", function(req, res, next) {
  try {
    feedbacksModel.findOne(
      {
        _id: req.sanitize(req.params.id),
        instructor: req.user.email
      },
      (err, result) => {
        if (err) {
          return res.terminate(err);
        }
        res.renderState("admin/portals/feedbacks-prof/midsem/view", {
          feedback: result
        });
      }
    );
  } catch (err) {
    return res.terminate(err);
  }
});

module.exports = router;
