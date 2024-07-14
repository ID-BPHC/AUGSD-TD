let express = require("express");
let router = express.Router();
let fileUpload = require("express-fileupload");
let fs = require("fs");
let appRoot = require("app-root-path");
let path = require("path");
router.use(
  fileUpload({
    safeFileNames: true,
    preserveExtension: true,
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  })
);
router.get("/", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/reg-grad", function(err, files) {
    res.renderState("admin/portals/control/reg-grad", { forms: files });
  });
});

router.post("/addNewForms", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/reg-grad", function(err, files) {
    //removing old files.
    let oldForms = Object.keys(req.body);
    let deletedOldForms = [];
    if (files) {
      files.forEach(file => {
        if (oldForms.indexOf(file) == -1) {
          deletedOldForms.push(file);
        }
      });
    }
    if (deletedOldForms) {
      deletedOldForms.forEach(function(deletedOldForm) {
        fs.unlinkSync(
          appRoot.path + "/public/AUGSD/reg-grad/" + deletedOldForm
        );
      });
    }

    // adding new files.
    fs.mkdir(path.join(appRoot.path, "/public/AUGSD/reg-grad"), function(err) {
      if (err && err.code !== "EEXIST") {
        res.terminate(err);
      }
      if (req.files) {
        newFiles = Object.keys(req.files);
        newFiles.forEach(file => {
          req.files[file].mv(
            path.join(
              appRoot.path,
              "/public/AUGSD/reg-grad",
              req.files[file].name
            ),
            function(err) {
              if (err) {
                console.log("Error is ", err);
                return res.terminate(err);
              } else {
                console.log("I am here 1...");
                return res.renderState("custom_errors", {
                  redirect: "/reg-grad",
                  timeout: 2,
                  supertitle: "Submitted the Registration and Graduation Forms.",
                  message: "Success",
                  details: "Redirecting to Registration and Graduation portal."
                });
              }
            }
          );
        });
      } else {
        console.log("I am here 2...");
        return res.renderState("custom_errors", {
          redirect: "/reg-grad",
          timeout: 2,
          supertitle: "Submitted the Registration and Graduation Forms.",
          message: "Success",
          details: "Redirecting to Registration and Gradution portal."
        });
      }
    });
  });
});
module.exports = router;
