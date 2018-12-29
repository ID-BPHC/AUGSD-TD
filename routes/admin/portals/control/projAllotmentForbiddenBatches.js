let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let settingsModel = fq("schemas/settings");

router.post("/", function(req, res) {
  let years = req.sanitize(req.body.year);
  let yearsArr = [];
  yearsArr = years.split(",");
  yearsArr.forEach(year => {
    year = year.trim();
  });
  settingsModel.find({ name: "proj-allotment-forbidden-batches" }, function(
    err,
    docs
  ) {
    if (docs[0]) {
      docs[0].value = yearsArr;
      docs[0].save(function(err) {
        if (err) res.terminate(err);
      });
    } else {
      var forbidden_batches = new settingsModel({
        name: "proj-allotment-forbidden-batches",
        description:
          "These are the forbidden batches for which the portal won't be opened.",
        value: yearsArr
      });
      forbidden_batches.save(function(err) {
        if (err) {
          res.terminate(err);
        }
      });
    }
  });
  res.redirect(req.get("referer"));
});
module.exports = router;
