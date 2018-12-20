let express = require("express");
let path = require("path");
let router = express.Router();
let fq = require("fuzzquire");

let holiday = require("./holidays.js");
let manageAdmins = require("./manageAdmins.js");
let portalToggle = require("./portals.js");
let switchUser = require("./switchUser.js");
let ttExceptions = require("./ttExceptions");
let project_guidelines = require("./project-allotment-guidelines");

router.use("/holidays", holiday);
router.use("/manage-admins", manageAdmins);
router.use("/portal-toggle", portalToggle);
router.use("/switch-user", switchUser);
router.use("/tt-exceptions", ttExceptions);
router.use("/project-allotment-guidelines", project_guidelines);

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/control");
});

module.exports = router;
