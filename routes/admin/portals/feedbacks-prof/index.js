var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var feedbacksModel = fq("schemas/feedbacks");
var adminsModel = fq("schemas/admins");
const dump = require("./../feedbacks-admin/export");

["/export/24x7", "/export/midsem"].forEach(exportType => {
  router.use(exportType, dump);
});

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/feedbacks");
});

["24x7", "midsem"].forEach(fb_type => {
  router.get("/" + fb_type, (req, res, next) => {
    try {
      feedbacksModel.find(
        {
          instructor: req.user.email,
          type: fb_type
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
          res.renderState("admin/portals/feedbacks-prof/" + fb_type, {
            feedbacks: result
          });
        }
      );
    } catch (err) {
      return res.terminate(err);
    }
  });
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
