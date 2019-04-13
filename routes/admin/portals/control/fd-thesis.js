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
    files.forEach(file => {
      if (oldForms.indexOf(file) == -1) {
        deletedOldForms.push(file);
      }
    });
    if (deletedOldForms) {
      deletedOldForms.forEach(function(deletedOldForm) {
        fs.unlinkSync(
          appRoot.path + "/public/AUGSD/fd-thesis/" + deletedOldForm
        );
      });
    }

    // adding new files.
    fs.mkdir(path.join(appRoot.path, "/public/AUGSD/fd-thesis"))
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
                if (err) return res.terminate(err);
                return res.renderState("custom_errors", {
                  redirect: "/fd-thesis",
                  timeout: 2,
                  supertitle: "Submitted the FD-Thesis Forms.",
                  message: "Success",
                  details: "Redirecting to FD-thesis portal."
                });
              }
            );
          });
        } else {
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
