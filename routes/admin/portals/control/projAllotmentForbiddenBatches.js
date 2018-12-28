let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let settingsModel = fq("schemas/settings");

router.post("/", function(req, res) {
  let years = req.sanitize(req.body.year);
  let years_arr = [];
  for (let i = 0; i < years.length; i = i + 4) {
    years_arr.push(years.slice(i, i + 4));
  }
  settingsModel.find({ name: "proj-allotment-forbidden-batches" }, function(
    err,
    docs
  ) {
    if (docs[0]) {
      docs[0].value = years_arr;
      docs[0].save(function(err) {
        if (err) res.terminate(err);
      });
    } else {
      var forbidden_batches = new settingsModel({
        name: "proj-allotment-forbidden-batches",
        description:
          "These are the forbidden batches for which the portal won't be opened.",
        value: years_arr
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
