let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let fileUpload = require("express-fileupload");
let Promise = require("bluebird");
let async = require("async");
let inductionsModel = fq("schemas/inductions");
let fs = Promise.promisifyAll(require("fs"));
let config = fq("config");
let path = require("path");
let appRoot = require("app-root-path");

const { check, validationResult } = require("express-validator/check");

router.use(
  fileUpload({
    safeFileNames: true,
    preserveExtension: true,
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  })
);

router.use(function(req, res, next) {
  async.each(
    config.inductionBatchPrefixes,
    function(prefix, checkNext) {
      if (req.user.idNumber.indexOf(prefix) == 0) {
        return next();
      }
      checkNext();
    },
    function() {
      res.renderState("custom_errors", {
        redirect: "/dashboard",
        timeout: 3,
        supertitle: "Error",
        message: "Not Eligible",
        details: "Sorry. You are not eligible to participate in the inductions."
      });
    }
  );
});

router.get("/", function(req, res, next) {
  res.renderState("dashboard/portals/inductions");
});

router.post(
  "/apply",
  [
    check("cgpa")
      .exists()
      .withMessage("No CGPA")
      .isFloat({
        min: 0.0,
        max: 10.0
      })
      .withMessage("Invalid CGPA"),
    check("hours")
      .exists()
      .withMessage("No Hours/Week Specified")
      .isFloat()
      .withMessage("Invalid Hours"),
    check("reason")
      .exists()
      .withMessage("No Reason Specified")
      .not()
      .isEmpty()
      .withMessage("Invalid Reason")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", {
        errors: errors.mapped(),
        timeout: 3,
        redirect: "/dashboard/inductions"
      });
    }
    let data = {
      cgpa: req.sanitize(req.body.cgpa),
      hours: req.sanitize(req.body.hours),
      github: req.sanitize(req.body.github),
      reason: req.sanitize(req.body.reason),
      nodejs: typeof req.body.nodejs !== "undefined" ? true : false
    };
    data.user = req.user.email.split("@")[0];
    if (req.files.resume == undefined) {
      return res.renderState("form-errors", {
        errors: [
          {
            msg: "Resume file not selected for upload"
          }
        ],
        timeout: 3,
        redirect: "/dashboard/inductions"
      });
    }
    let storePath = appRoot.path;
    if (config.fileStorage != "") {
      storePath = config.fileStorage;
    }
    fs.mkdirAsync(storePath)
      .catch(
        {
          code: "EEXIST"
        },
        function(e) {}
      )
      .catch(function(e) {
        console.log("Error to create folder: " + e);
        return res.terminate(e);
      })
      .then(function() {
        fs.mkdirAsync(path.join(storePath, "inductions"))
          .catch(
            {
              code: "EEXIST"
            },
            function(e) {}
          )
          .catch(function(e) {
            console.log("Error to create folder: " + e);
            return res.terminate(e);
          })
          .then(function() {
            data.resumePath = path.join(storePath, "inductions", data.user);
            data.originalName = req.files.resume.name;
            inductionsModel.findOneAndUpdate(
              {
                user: data.user
              },
              data,
              {
                upsert: true
              },
              function(err, doc) {
                if (err) return res.terminate(err);
              }
            );
            let resumeFile = req.files.resume;
            resumeFile.mv(data.resumePath, function(err) {
              if (err) return res.terminate(err);
              console.log(resumeFile.data.length);
              return res.renderState("custom_errors", {
                redirect: "/dashboard",
                timeout: 2,
                supertitle: "Submitted Induction Application.",
                message: "Success",
                details:
                  "Your application was submitted/updated. Thank you :). Redirecting"
              });
            });
          });
      });
  }
);

module.exports = router;
