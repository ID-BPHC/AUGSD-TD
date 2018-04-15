var express = require('express');
var router = express.Router();

var fq = require('fuzzquire');
var applicationsModel = fq('schemas/project-applications');

router.get('/', (req, res, next) => {
	applicationsModel.aggregate([{
			$match: {
				student: req.sanitize(req.user.email)
			}
		},
		{
			$lookup: {
				from: "projects",
				localField: "project",
				foreignField: "_id",
				as: "projectForeign"
			}
		},
		{
			$project: {
				status: 1,
				updated: 1,
				"title": "$projectForeign.title"
			}
		},
		{
			$unwind: "$title"
		}
	], function (err, applications) {
		if (err) {
			console.log(err);
			return res.terminate("Could not find applications");
		}
		return res.renderState("dashboard/portals/project-update", {
			applications: applications
		});
	});
});

router.get('/view/:id', (req, res, next) => {
	res.renderState("dashboard/portals/project-update/update");
});

module.exports = router;
