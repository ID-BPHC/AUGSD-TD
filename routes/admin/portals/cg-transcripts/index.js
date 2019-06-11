var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.renderState("admin/portals/cg-transcripts");
});


module.exports = router;
