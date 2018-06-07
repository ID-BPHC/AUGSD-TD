var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");

var adminsModel = fq("schemas/admins");

router.get("/", function(req, res, next) {
  adminsModel.find({}, {}, { sort: { email: 1 } }, function(err, users) {
    if (err) {
      console.log(err);
      return res.terminate("Could not find admins");
    }

    return res.renderState("admin/portals/control/switch-user", {
      users: users
    });
  });
});

router.post("/switch", function(req, res, next) {
  req.session.switched = true;
  req.session.newUser = req
    .sanitize(req.body.users)
    .split("|")[0]
    .trim();
  req.session.save();
  return res.redirect("/admin");
});

module.exports = router;
