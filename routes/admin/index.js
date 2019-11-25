let express = require("express");
let router = express.Router();
let session = require("express-session");
let redis = require("redis");
let redisStore = require("connect-redis")(session);
let client = redis.createClient();

let adminsModel = require("../../schemas/admins");
let portalsModel = require("../../schemas/portals");
let settingsModel = require("../../schemas/settings");

let auth = require("../../middleware/auth");
let config = require("../../config");

let originalPath = "/admin";

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next) {
  let reqPortal = req.originalUrl.split("/")[2];

  portalsModel.find(
    {
      name: reqPortal,
      active: true,
      mode: config.siteMode,
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
            details: "Contact Timetable Division software team for assistance.",
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
    admin: true,
    mode: config.siteMode
  },
  function(err, portals) {
    portals.forEach(function(portal) {
      try {
        let portalPath = require("./portals/" + portal.name);
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
    store: new redisStore({
      host: config.redisHost,
      port: config.redisPort,
      pass: config.redisPass,
      client: client
    }),
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
          let CreateAdmin = adminsModel.create({
            email: req.user.emails[0].value,
            name: req.user.displayName,
            superUser: true
          });
          let SettingsAdd = settingsModel.create({
            name: "config",
            description: "Sets the Super Admin during first run.",
            value: [req.user.emails[0].value]
          });
          let CheckAdmin = function() {
            req.session.destroy(function() {
              res.redirect("/admin/login");
            });
          };
          let AfterCreateAdmin = CreateAdmin.then(SettingsAdd).then(CheckAdmin);
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
                res.redirect(originalPath);
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
    originalPath = req.originalUrl;
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
        active: true,
        mode: config.siteMode
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

router.get("/switch-back", function(req, res, next) {
  req.session.switched = false;
  return res.redirect("/admin");
});

router.get("/", function(req, res, next) {
  res.renderState("admin/index");
});

module.exports = router;
