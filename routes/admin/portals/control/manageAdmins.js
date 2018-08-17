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
          adminPortals: portals
        });
      });
    }
  );
});

router.post("/add", function(req, res, next) {
  console.log(req.body);
  adminsModel.find({ email: req.sanitize(req.body.email) }, function(
    err,
    admins
  ) {
    if (err) return res.terminate("Could not find admins");
    if (admins.length == 0) {
      adminsModel.create(
        {
          name: req.sanitize(req.body.name),
          email: req.sanitize(req.body.email),
          portals: req.body.portals,
          home: "/",
          department:
            req.sanitize(req.body.department).indexOf("|") >= 0
              ? req.sanitize(req.body.department).split("|")[1]
              : "",
          departmentCode:
            req.sanitize(req.body.department).indexOf("|") >= 0
              ? req.sanitize(req.body.department).split("|")[0]
              : "",
          maxProjects: parseInt(req.sanitize(req.body.maxProjects)),
          superUser: false
        },
        function(err) {
          if (err) return res.terminate("Could not save admin");
          return res.redirect("/admin/control/manage-admins");
        }
      );
    } else {
      return res.renderState("custom_errors", {
        redirect: "/admin/control/manage-admins",
        timeout: 2,
        supertitle: "Already Exists",
        message: "This email already exists in the database",
        details: " "
      });
    }
  });
});

router.post("/delete", function(req, res, next) {
  adminsModel.remove({ email: req.sanitize(req.body.admin) }, function(err) {
    if (err) return res.terminate("Could not delete admin");
    return res.redirect("/admin/control/manage-admins");
  });
});

module.exports = router;
