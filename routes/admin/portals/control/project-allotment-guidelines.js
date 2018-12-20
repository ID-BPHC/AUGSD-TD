let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let settingsModel = fq("schemas/settings");

router.get("/", (req, res, next) => {
  settingsModel.find({ name: "Project-Allotment-Guidelines" }, function(
    err,
    docs
  ) {
    res.renderState("admin/portals/control/project-allotment-guidelines", {
      lines: docs[0] ? docs[0].value : ""
    });
  });
});
router.post("/project-guidelines-submit", (req, res, next) => {
  let line1 = req.sanitize(req.body.line1);
  let line2 = req.sanitize(req.body.line2);
  let line3 = req.sanitize(req.body.line3);
  let line4 = req.sanitize(req.body.line4);
  let line5 = req.sanitize(req.body.line5);
  settingsModel.find({ name: "Project-Allotment-Guidelines" }, function(
    err,
    docs
  ) {
    if (!docs[0]) {
      let guidelines_settings = new settingsModel({
        name: "Project-Allotment-Guidelines",
        description:
          "These are the project allotment guidelines given by AUGSD.",
        value: [line1, line2, line3, line4, line5]
      });
      guidelines_settings.save(function(err) {
        if (err) {
          console.log(err);
          res.terminate(err);
        } else console.log("Saved!");
      });
    } else if (docs[0]) {
      console.log(docs[0].value);
      docs[0].value = [line1, line2, line3, line4, line5];
      docs[0].save(function(err) {
        if (err) {
          console.log(err);
          res.terminate(err);
        } else console.log("Updated and saved.");
      });
    }
  });
  res.redirect(req.get("referer"));
});

module.exports = router;
