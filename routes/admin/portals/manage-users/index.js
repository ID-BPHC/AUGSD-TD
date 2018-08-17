const express = require("express");
const router = express.Router();
const fq = require("fuzzquire");
const adminsModel = fq("schemas/admins");
const portalsModel = fq("schemas/portals");
const { check, validationResult } = require("express-validator/check");

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
      res.renderState("admin/portals/manage-users/add", {
        access: access
      });
    });
});

router.post(
	"/adduser/add",
	[
		check("name")
			.exists()
			.withMessage("Name not specified")
			.not()
			.isEmpty()
			.withMessage("Name invalid"),
		check("email")
			.exists()
			.withMessage("Email not specified")
			.not()
			.isEmpty()
			.withMessage("Email invalid"),			
		check("dep")
			.exists()
			.withMessage("Department not specified")
			.not()
			.isEmpty()
			.withMessage("Department invalid"),			
		check("depcode")
			.exists()
			.withMessage("Department code not specified")
			.not()
			.isEmpty()
			.withMessage("Department code invalid"),			
		check("portals")
			.exists()
			.withMessage("Access to portals not specified"),									
	],

	function(req, res, next) {
		const errors = validationResult(req);
    	if (!errors.isEmpty()) {
      		return res.renderState("form-errors", { errors: errors.mapped() });
		}
	
		var name = req.sanitize(req.body.name);
		var email = req.sanitize(req.body.email);
		var department = req.sanitize(req.body.department);
		var depcode = req.sanitize(req.body.depcode);
		var maxproject = req.body.project || 0;
		var portals = req.body.portals;

		adminsModel.find({email: email},(err, results)=>{
			if(err){
				return res.terminate(err);
			}

			if(results.length == 0){
				adminsModel.create({
					name : name,
					email: email,
					department : department,
					departmentCode: depcode,
					maxProjects : maxproject,
					superUser : false,
					portals: portals,
					home : ""
				},(err)=>{
					if(err){
						return res.terminate(err);
					}

					return res.renderState("custom_errors",{
						redirect : "/admin",
						timeout : 3,
						supertitle: "Admin added",
						message: "The admin has been added. Redirecting ..."
					});
				});
			}else{
					return res.renderState("custom_errors", {
            redirect: "/admin/manage-users/adduser",
            timeout: 5,
            supertitle: "Error",
            message:
              "The admin has already been added. Redirecting ..."
          });

			}
		})




	}

);
module.exports = router;