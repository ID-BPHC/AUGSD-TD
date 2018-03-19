var express = require('express');
var router = express.Router();

var fq = require('fuzzquire');
var Promise = require('promise');

var projectsModel = fq('schemas/projects');
var headsModel = fq('schemas/project-heads');

router.get('/', function (req, res, next) {
	return res.renderState("dashboard/portals/project-allotment-student");
});

router.get('/view', function (req, res, next) {
	headsModel.distinct('department', function (err, departments) {
		if (err) {
			console.log(err);
			return res.terminate("Could not find departments");
		}
		return res.renderState("dashboard/portals/project-allotment-student/select-department", {
			departments: departments
		});

	});
});

router.post('/view', function (req, res, next) {
	projectsModel.aggregate(
		[{
			$lookup: {
				from: "projectheads",
				localField: "instructor",
				foreignField: "instructor",
				as: "instructorForeign"
			}
		}, {
			$project: {
				"department": "$instructorForeign.department",
				"instructorName": "$instructorForeign.name",
				title: 1,
				description: 1,
				instrutor: 1,
				name: 1,
				updated: 1,
				type: 1
			}
		}, {
			$unwind: "$department"
		}, {
			$unwind: "$instructorName"
		}, {
			$match: {
				department: req.body.departments
			}
		}],
		function (err, projects) {
			if (err) {
				console.log(err);
				return res.terminate("Aggregate Error");
			}
			return res.json(projects);
			//return res.renderState("dashboard/portals/project-allotment-student/view-department");
		});
});

module.exports = router;
