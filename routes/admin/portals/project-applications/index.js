var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var mongoose = require('mongoose');

var projectsModel = fq('schemas/projects');
var applicationsModel = fq('schemas/project-applications');

router.get('/', function (req, res, next) {
	applicationsModel.aggregate([{
			$lookup: {
				from: 'students',
				localField: 'student',
				foreignField: 'email',
				as: 'studentForeign'
			}
		}, {
			$lookup: {
				from: 'projects',
				localField: 'project',
				foreignField: '_id',
				as: 'projectForeign'
			}
		},

		{
			$project: {
				'projectID': '$projectForeign._id',
				'studentName': '$studentForeign.name',
				'studentID': '$studentForeign.idNumber',
				'instructor': '$projectForeign.instructor',
				'title': '$projectForeign.title',
				student: 1,
				cgpa: 1,
				experience: 1,
				status: 1
			}
		},
		{
			$unwind: "$studentName"
		},
		{
			$unwind: "$instructor"
		},
		{
			$unwind: "$title"
		},
		{
			$unwind: "$studentID"
		},
		{
			$match: {
				'instructor': req.sanitize(req.user.email)
			}
		}
	], function (err, applications) {

		if (err) {
			console.log(err);
			return res.terminate(err);
		}

		return res.renderState('admin/portals/project-applications', {
			applications: applications
		});

	});
});

router.get('/:action/:aid/project/:pid', function (req, res, next) {

	var applicationID = req.sanitize(req.params.aid);
	var projectID = req.sanitize(req.params.pid);
	var action = req.sanitize(req.params.action);

	var actionHash = {
		'approve': 'A',
		'reject': 'R',
		'undo': 'P'
	};

	projectsModel.find({ _id: projectID, instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate("Could Not Find Project");
		}

		if (projects.length == 0) {

			return res.status(403).end();

		} else {

			applicationsModel.update({ _id: applicationID, project: projectID }, { $set: { status: actionHash[action] } }, function (err, num) {

				if (err) {
					console.log(err);
					return res.terminate("Could Not Modify Application");
				}

				return res.redirect('/admin/project-applications');
			});
		}
	});
});

module.exports = router;
