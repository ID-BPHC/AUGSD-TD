let express = require("express");
let router = express.Router();
let fileUpload = require("express-fileupload");
let fs = require("fs");
let appRoot = require("app-root-path");
let path = require("path");

router.get("/", function(req, res) {
  fs.readdir(appRoot.path + "/public/AUGSD/registration", function(err, files) {
    res.renderState("admin/portals/control/registration", { forms: files });
  });
});

module.exports = router;
