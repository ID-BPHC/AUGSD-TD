var express = require('express');
var router = express.Router();

var fq = require('fuzzquire');
var mongoose = require('mongoose');
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

router.get('/view/:id', function (req, res, next) {
	projectsModel.aggregate([{
		$match: {
			_id: mongoose.Types.ObjectId(req.sanitize(req.params.id))
		}
	}, {
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
			instructor: 1,
			name: 1,
			updated: 1,
			type: 1
		}
	}, {
		$unwind: "$department"
	}, {
		$unwind: "$instructorName"
	}], function (err, project) {

		if (err) {
			console.log(err);
			return res.terminate("Error: Could not find project");
		}

		if(project.length == 0) {
			return res.renderState('custom_errors', {
				redirect: "/dashboard/project-allotment-student",
                timeout: 2,
                supertitle: ".",
                message: "Project Not Found",
                details: "Invalid Project ID"
			});
		}

		return res.renderState("dashboard/portals/project-allotment-student/view-project", {
			project: project[0]
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
				instructor: 1,
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
			return res.renderState("dashboard/portals/project-allotment-student/view-department", {
				projects: projects,
				department: req.body.departments
			});
		});
});

module.exports = router;
