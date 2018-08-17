const express = require("express");
const router = express.Router();
const fq = require("fuzzquire");
const adminsModel = fq("schemas/admins");
const portalsModel = fq("schemas/portals");

router.get("/", (req, res, next)=>{
	res.renderState("./admin/portals/manage-users");
});

router.get("/updateuser",(req, res, next)=>{
	res.renderState("admin/portals/manage-users/update");
})

router.get("/adduser", function(req, res, next) {
  portalsModel
    .find({admin:true})
    .exec(function(err, access) {
      if (err) {
        res.terminate(err);
      }
      console.log(access);
      res.renderState("admin/portals/manage-users/add", {
        access: access
      });
    });
});

router.post("/adduser/add", (req, res, next)=>{
	
})

module.exports = router;