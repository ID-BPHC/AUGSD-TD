let express = require("express");
let path = require("path");
let router = express.Router();
let fq = require("fuzzquire");
let settingsModel = fq("schemas/settings");

let holiday = require("./holidays.js");
let manageAdmins = require("./manageAdmins.js");
let portalToggle = require("./portals.js");
let switchUser = require("./switchUser.js");
let ttExceptions = require("./ttExceptions");
let projectGuidelines = require("./projectAllotmentGuidelines.js");
let projAllotmentForbiddenBatches = require("./projAllotmentForbiddenBatches.js");
let blockAllRooms = require("./blockAllRooms.js");
let fdThesis = require("./fd-thesis.js");
let acadRecords = require("./academic-records.js");
let regGrad = require("./reg-grad.js");
var roomMap = require("./roomMap.js");

router.use("/holidays", holiday);
router.use("/manage-admins", manageAdmins);
router.use("/portal-toggle", portalToggle);
router.use("/switch-user", switchUser);
router.use("/tt-exceptions", ttExceptions);
router.use("/project-allotment-guidelines", projectGuidelines);
router.use(
  "/project-allotment-forbidden-batches",
  projAllotmentForbiddenBatches
);
router.use("/block-all-rooms", blockAllRooms);
router.use("/room-map", roomMap);
router.use("/fd-thesis", fdThesis);
router.use("/reg-grad", regGrad);
router.use("/academic-records", acadRecords);

router.get("/", function(req, res, next) {
  settingsModel.find(
    {
      name: "proj-allotment-forbidden-batches"
    },
    function(err, docs) {
      res.renderState("admin/portals/control", {
        years: docs[0] ? docs[0].value : null
      });
    }
  );
});

module.exports = router;
