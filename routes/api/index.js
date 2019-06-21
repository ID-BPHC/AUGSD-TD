var express = require("express");
var router = express.Router();
var v1 = require("./v1/index");

router.use("/v1", v1);

module.exports = router;
