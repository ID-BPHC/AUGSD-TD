var express = require("express");
var router = express.Router();
var session = require("express-session");

var adminsModel = require("../../schemas/admins");
var portalsModel = require("../../schemas/portals");
var settingsModel = require("../../schemas/settings");

var auth = require("../../middleware/auth");
var config = require("../../config");

var profile = require("./profile");

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next) {
  var reqPortal = req.originalUrl.split("/")[2];

  portalsModel.find(
    {
      name: reqPortal,
      active: true,
      admin: true
    },
    function(err, result) {
      if (err) {
        return res.terminate(err);
      }
      if (result.length > 0 || req.user.superUser) {
        if (req.user.portals.indexOf(reqPortal) >= 0 || req.user.superUser) {
          next();
        } else {
          res.render("custom_errors", {
            message: "You do not have permission to access this portal",
            details:
              "Contact Timetable Division software team for assistance.",
            redirect: "/admin",
            timeout: 5
          });
        }
      } else {
        res.render("custom_errors", {
          message: "This portal has been disabled by the Administrator",
          details: "Contact Timetable Division software team for assistance.",
          redirect: "/admin",
          timeout: 5
        });
      }
    }
  );
};

portalsModel.find(
  {
    admin: true
  },
  function(err, portals) {
    portals.forEach(function(portal) {
      try {
        var portalPath = require("./portals/" + portal.name);
        router.use("/" + portal.name, securityCheck, portalPath);
      } catch (err) {
        console.log(err);
      }
    });
  }
);

/* Portal Middleware Configuration End */

/********* Configure adminPassport *********/

router.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: config.authSecretAdmin
  })
);

router.use(auth.adminPassport.initialize());
router.use(auth.adminPassport.session());

router.get(
  "/login",
  auth.adminPassport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/auth/google/callback",
  auth.adminPassport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    settingsModel.find(
      {
        name: "config"
      },
      function(err, result) {
        if (err) {
          return res.terminate(err);
        }
        if (result.length == 0) {
          var CreateAdmin = adminsModel.create({
            email: req.user.emails[0].value,
            name: req.user.displayName,
            superUser: true
          });
          var SettingsAdd = settingsModel.create({
            name: "config",
            description: "Sets the Super Admin during first run.",
            value: [req.user.emails[0].value]
          });
          var CheckAdmin = function() {
            req.session.destroy(function() {
              res.redirect("/admin/login");
            });
          };
          var AfterCreateAdmin = CreateAdmin.then(SettingsAdd).then(CheckAdmin);
        } else {
          adminsModel.find(
            {
              email: req.user.emails[0].value
            },
            function(err, result) {
              if (err) {
                return res.terminate(err);
              }
              if (result.length == 0) {
                req.session.destroy(function() {
                  res.render("custom_errors", {
                    message: "You are not an administrator",
                    details:
                      "This google account is not registered as an administrator.",
                    redirect: "/admin",
                    timeout: 5
                  });
                });
              } else {
                req.session.profileImage = req.sanitize(
                  req.user._json.image.url
                );
                req.session.userType = "admin";
                req.session.switched = false;
                res.redirect("/admin");
              }
            }
          );
        }
      }
    );
  }
);

router.get("/logout", function(req, res) {
  req.session.destroy(function(err) {
    res.redirect("/");
  });
});

/********* adminPassport Config End *********/

/*Add end points for non logged in users above this line*/

router.use(function(req, res, next) {
  if (!req.user) {
    res.redirect("/admin/login");
  } else {
    next();
  }
});

/* Below end points are availible only to logged in users */

router.use(function(req, res, next) {
  res.renderState = function(view, params = {}) {
    portalsModel.find(
      {
        admin: true,
        active: true
      },
      function(err, portals) {
        if (err) {
          return res.terminate(err);
        }
        if (typeof req.originalUrl.split("/")[1] !== "undefined") {
          params.reqPortal = req.originalUrl.split("/")[1];
        }
        if (typeof req.originalUrl.split("/")[2] !== "undefined") {
          params.reqPortal = req.originalUrl.split("/")[2];
        }
        params.profileImage = req.session.profileImage;
        params.portals = portals;
        params.user = req.user;
        params.rootURL = "/admin";
        params.switched = req.session.switched;
        params.dashboard = {
          type: "Administrator"
        };

        res.render(view, params);
      }
    );
  };
  next();
});

router.use("/profile", profile);

router.get("/switch-back", function(req, res, next) {
  req.session.switched = false;
  return res.redirect("/admin");
});

router.get("/", function(req, res, next) {
  res.renderState("admin/index");
});

module.exports = router;
