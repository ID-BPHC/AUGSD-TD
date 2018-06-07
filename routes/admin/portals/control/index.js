var express = require("express");
var path = require("path");
var router = express.Router();
var fq = require("fuzzquire");

var holiday = require("./holidays.js");
var portalToggle = require("./portals.js");
var switchUser = require("./switch-user.js");

router.use("/holidays", holiday);
router.use("/portalToggle", portalToggle);
router.use("/switch-user", switchUser);

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/control");
});

module.exports = router;
