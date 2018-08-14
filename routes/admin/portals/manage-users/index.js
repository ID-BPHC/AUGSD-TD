const express = require("express");
const router = express.Router();
const fq = require("fuzzquire");
const adminsModel = fq("schemas/admins");

router.get("/", (req, res, next)=>{
	res.renderstate("admin/portals/manage-users");
});

router.get("/adduser",(req, res, next)=>{
	res.renderstate("admin/portals/manage-users/add");
});

router.get("/updateuser",(req, res, next)=>{
	res.renderstate("admin/portals/manage-users/update");
})