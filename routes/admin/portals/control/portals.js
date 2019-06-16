var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var portalsModel = fq("schemas/portals");
var config = fq("config");

router.get("/toggle/:id", function(req, res, next) {
  portalsModel.findOne(
    { _id: req.sanitize(req.params.id), mode: config.siteMode },
    function(err, portal) {
      if (err) {
        return res.terminate(err);
      }

      portalsModel.update(
        { _id: req.sanitize(req.params.id), mode: config.siteMode },
        { active: !portal.active },
        function(err) {
          if (err) {
            return res.terminate(err);
          }
          return res.redirect("/admin/control/portal-toggle");
        }
      );
    }
  );
});

router.get("/", function(req, res, next) {
  portalsModel.find(
    { name: { $ne: "control" }, mode: config.siteMode },
    function(err, portals) {
      if (err) {
        return res.terminate(err);
      }
      return res.renderState("admin/portals/control/portalToggle", {
        allPortals: portals
      });
    }
  );
});

module.exports = router;
