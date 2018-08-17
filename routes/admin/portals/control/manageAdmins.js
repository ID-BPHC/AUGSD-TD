let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");

let adminsModel = fq("schemas/admins");

router.get("/", function(req, res, next) {
  res.send("Manage admins portal");
});

module.exports = router;
