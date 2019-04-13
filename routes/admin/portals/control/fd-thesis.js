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
  fs.readdir(appRoot.path + "/public/AUGSD/fd-thesis", function(err, files) {
    res.renderState("admin/portals/control/fd-thesis", { forms: files });
  });
});

router.post("/addNewForms", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/fd-thesis", function(err, files) {
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
          appRoot.path + "/public/AUGSD/fd-thesis/" + deletedOldForm
        );
      });
    }

    // adding new files.
    fs.mkdir(path.join(appRoot.path, "/public/AUGSD/fd-thesis"), function(err) {
      if (err.code !== "EEXIST") {
        res.terminate(err);
      }
      if (req.files) {
        newFiles = Object.keys(req.files);
        newFiles.forEach(file => {
          req.files[file].mv(
            path.join(
              appRoot.path,
              "/public/AUGSD/fd-thesis",
              req.files[file].name
            ),
            function(err) {
              if (err) {
                console.log("Error is ", err);
                return res.terminate(err);
              } else {
                console.log("I am here 1...");
                return res.renderState("custom_errors", {
                  redirect: "/fd-thesis",
                  timeout: 2,
                  supertitle: "Submitted the FD-Thesis Forms.",
                  message: "Success",
                  details: "Redirecting to FD-thesis portal."
                });
              }
            }
          );
        });
      } else {
        console.log("I am here 2...");
        return res.renderState("custom_errors", {
          redirect: "/fd-thesis",
          timeout: 2,
          supertitle: "Submitted the FD-Thesis Forms.",
          message: "Success",
          details: "Redirecting to FD-thesis portal."
        });
      }
    });
  });
});
module.exports = router;
