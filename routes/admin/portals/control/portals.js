var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var portalsModel = fq("schemas/portals");

router.get("/toggle/:id", function(req, res, next) {
  portalsModel.findOne({ _id: req.sanitize(req.params.id) }, function(
    err,
    portal
  ) {
    if (err) {
      return res.terminate(err);
    }

    portalsModel.update(
      { _id: req.sanitize(req.params.id) },
      { active: !portal.active },
      function(err) {
        if (err) {
          return res.terminate(err);
        }
        return res.redirect("/admin/control/portal-toggle");
      }
    );
  });
});

router.get("/", function(req, res, next) {
  portalsModel.find({ name: { $ne: "control" } }, function(err, portals) {
    if (err) {
      return res.terminate(err);
    }
    return res.renderState("admin/portals/control/portalToggle", {
      allPortals: portals
    });
  });
});

module.exports = router;
