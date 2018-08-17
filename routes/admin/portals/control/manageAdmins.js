let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");

let adminsModel = fq("schemas/admins");
let portalsModel = fq("schemas/portals");

router.get("/", function(req, res, next) {
  adminsModel.find(
    { email: { $ne: req.user.email } },
    {},
    { sort: { email: 1 } },
    function(err, admins) {
      if (err) return res.terminate("Can not find admins");
      portalsModel.find({ admin: true }, function(err, portals) {
        if (err) return res.terminate("Can not find portals");
        return res.renderState("admin/portals/control/manageAdmins", {
          admins,
          portals
        });
      });
    }
  );
});

router.post("/delete", function(req, res, next) {
  adminsModel.remove({ email: req.sanitize(req.body.admin) }, function(err) {
    if (err) return res.terminate("Could not delete admin");
    return res.redirect("/admin/control/manage-admins");
  });
});

module.exports = router;
