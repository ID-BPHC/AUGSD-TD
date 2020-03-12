let express = require("express");
let router = express.Router();
let session = require("express-session");
let redis = require("redis");
let redisStore = require("connect-redis")(session);
let client = redis.createClient();

let studentsModel = require("../../schemas/students");
let portalsModel = require("../../schemas/portals");
let bugsModel = require("../../schemas/bugs");

let auth = require("../../middleware/auth");
let config = require("../../config");

let originalPath = "/dashboard";

const { check, validationResult } = require("express-validator/check");

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next) {
  let reqPortal = req.originalUrl.split("/")[2];
  portalsModel.find(
    {
      name: reqPortal,
      active: true,
      mode: config.siteMode,
      admin: false
    },
    function(err, result) {
      if (err) {
        return res.terminate(err);
      }
      if (result.length > 0) {
        next();
      } else {
        res.renderState("custom_errors", {
          redirect: "/dashboard",
          timeout: 5,
          supertitle: "Portal.",
          callback: "/dashboard",
          message: "Disabled Portal",
          details:
            "This portal has been disabled by the Administrator. Please contact Timetable Division for assistance."
        });
      }
    }
  );
};

portalsModel.find(
  {
    admin: false,
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

/********* Configure studentPassport *********/

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
    secret: config.authSecretStudent
  })
);

router.use(auth.userPassport.initialize());
router.use(auth.userPassport.session());

router.get(
  "/login",
  auth.userPassport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/auth/google/callback",
  auth.userPassport.authenticate("google", {
    failureRedirect: "/dashboard/login"
  }),
  function(req, res) {
    studentsModel.find(
      {
        email: req.user.emails[0].value
      },
      function(err, result) {
        if (err) {
          res.renderState("custom_errors", {
            redirect: "/dashboard",
            timeout: 5,
            supertitle: "Critical Breakdown.",
            callback: "/",
            message: "Server Error",
            details:
              "An unexpected error occoured. Contact Timetable Division software team for assistance."
          });
        }
        if (result.length == 0) {
          if (
            req.user.emails[0].value.endsWith("hyderabad.bits-pilani.ac.in")
          ) {
            req.session.destroy(function() {
              res.render("custom_errors", {
                message: "Invalid User.",
                details: "Are you sure you selected your role properly?",
                callback: "/",
                redirect: "/dashboard",
                timeout: 15,
                supertitle: "Unauthorized User."
              });
            });
          } else {
            req.session.destroy(function() {
              res.render("custom_errors", {
                message: "Invalid Email.",
                details: "Please use your institute provided email only.",
                callback: "/",
                redirect: "/dashboard",
                timeout: 15,
                supertitle: "Unauthorized Domain."
              });
            });
          }
        } else {
          // console.log(req.user);
          req.session.profileImage = req.sanitize(req.user._json.image.url);
          req.session.userType = "user";
          res.redirect(originalPath);
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

router.get("/portals", function(req, res) {
  res.redirect("/dashboard");
});

/********* studentPassport Config End *********/

/*Add end points for non logged in users above this line*/

router.use(function(req, res, next) {
  if (!req.user) {
    originalPath = req.originalUrl;
    res.redirect("/dashboard/login");
  } else {
    next();
  }
});

router.use(function(req, res, next) {
  if (req.session.userType !== "user") {
    req.session.destroy(function(err) {
      originalPath = req.originalUrl;
      res.redirect("/dashboard/login");
    });
  } else {
    next();
  }
});

router.use(function(req, res, next) {
  res.renderState = function(view, params) {
    if (params == undefined || params == null) {
      params = {};
    }
    portalsModel.find(
      {
        admin: false,
        mode: config.siteMode,
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
        params.rootURL = "/dashboard";
        params.dashboard = {
          type: "Student"
        };
        res.render(view, params);
      }
    );
  };
  next();
});

/* Below end points are availible only to logged in users */

router.get("/", function(req, res, next) {
  res.renderState("dashboard/index");
});

router.get("/bug", function(req, res, next) {
  let params = req.params;
  params.categories = [
    "User Interface",
    "Feature Request",
    "Site Performance",
    "Site Operationality",
    "Thank You"
  ];
  res.renderState("dashboard/bug", params);
});

router.post(
  "/bug",
  [
    check("feedbacklist")
      .exists()
      .withMessage("No Category is specified")
      .not()
      .equals(". . .") // default value in the category selector
      .withMessage("No Category is specified"),
    check("feedback")
      .exists()
      .withMessage("Feedback is left empty")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Feedback is left empty")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("custom_errors", {
        redirect: "/dashboard",
        timeout: 2,
        supertitle: "Invalid Details",
        message: "Bug report Failed",
        details: errors.array().map(e => e.msg)
      });
    }

    let dataStore = {
      category: req.sanitize(req.body.feedbacklist),
      report: req.sanitize(req.body.feedback),
      useragent: req.sanitize(req.headers["user-agent"]),
      student: req.user.email
    };
    bugsModel.create(dataStore, function(err, response) {
      if (err) {
        res.renderState("custom_errors", {
          redirect: "/dashboard",
          timeout: 2,
          supertitle: "Failed submitting feedback.",
          message: "Failed",
          details: err
        });
      }
      res.renderState("custom_errors", {
        redirect: "/dashboard",
        timeout: 2,
        supertitle: "Submitted Report.",
        message: "Success",
        details: "Report has been submitted"
      });
    });
  }
);

router.get("/bug/policy", function(req, res, next) {
  res.renderState("dashboard/bug_policy");
});

router.get("/profile", function(req, res, next) {
  res.renderState("dashboard/profile");
});

module.exports = router;
