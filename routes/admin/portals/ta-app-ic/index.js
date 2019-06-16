var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/ta-app-ic");
});

module.exports = router;
