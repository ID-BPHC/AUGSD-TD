var express = require("express");
var router = express.Router();
var path = require("path");

router.get("/", (req, res, next) => {
  res.renderState("dashboard/portals/fd-thesis/index");
});
var forms = [
  "Off-Campus-Form-A",
  "Off-Campus-Form-B",
  "Pre-allotment-Guidelines"
];
forms.forEach(form => {
  router.get("/" + form, (req, res, next) => {
    console.log("heerre", form);
    res.sendFile(path.join(__dirname, "./" + form + ".pdf"));
  });
});
router.get("/Off-Campus-Form-A", (req, res, next) => {
  console.log("here");
  res.sendFile(path.join(__dirname, "./Off-Campus-Form-A.pdf"));
});
module.exports = router;
