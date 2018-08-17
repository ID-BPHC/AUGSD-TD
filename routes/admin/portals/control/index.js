let express = require("express");
let path = require("path");
let router = express.Router();
let fq = require("fuzzquire");

let holiday = require("./holidays.js");
let manageAdmins = require("./manageAdmins.js");
let portalToggle = require("./portals.js");
let switchUser = require("./switchUser.js");
let ttExceptions = require("./ttExceptions");

router.use("/holidays", holiday);
router.use("/manage-admins", manageAdmins);
router.use("/portal-toggle", portalToggle);
router.use("/switch-user", switchUser);
router.use("/tt-exceptions", ttExceptions);

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/control");
});

module.exports = router;
