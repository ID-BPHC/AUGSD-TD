var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var mongoose = require('mongoose');

var projectsModel = fq('schemas/projects');
var applicationsModel = fq('schemas/project-applications');

router.get('/', function (req, res, next) {
	projectsModel.find({ instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate(err);
		}

		return res.renderState('admin/portals/project-applications', {
			projects: projects
		});
	});
});

router.get('/project/:id', function (req, res, next) {
	projectsModel.findOne({ _id: req.sanitize(req.params.id) }, function (err, project) {

		if (err) {
			console.log(err);
			return res.terminate(err);
		}

		if (!project) {
			res.renderState('custom_errors', {
				redirect: "/admin/project-applications",
				timeout: 2,
				supertitle: ".",
				callback: "/",
				message: "Validation Error",
				details: "Project Not Found"
			});
		}

		if (project.instructor !== req.sanitize(req.user.email)) {
			return res.status(403).end();
		} else {
			applicationsModel.aggregate([{
					$match: {
						project: mongoose.Types.ObjectId(req.sanitize(req.params.id))
					}
				},
				{
					$lookup: {
						from: 'students',
						localField: 'student',
						foreignField: 'email',
						as: 'studentForeign'
					}
				},
				{
					$project: {
						'studentName': '$studentForeign.name',
						'studentID': '$studentForeign.idNumber',
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
					$unwind: "$studentID"
				}
			], function (err, applications) {

				if (err) {
					console.log(err);
					return res.terminate(err);
				}

				return res.renderState('admin/portals/project-applications/view', {
					project: project,
					applications: applications
				});

			});
		}

	});
});

router.get('/approve/:aid/project/:pid', function (req, res, next) {

	var applicationID = req.sanitize(req.params.aid);
	var projectID = req.sanitize(req.params.pid);

	projectsModel.find({ _id: projectID, instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate("Could Not Find Project");
		}

		if (projects.length == 0) {

			return res.status(403).end();

		} else {

			applicationsModel.update({ _id: applicationID, project: projectID }, { $set: { status: "A" } }, function (err, num) {

				if (err) {
					console.log(err);
					return res.terminate("Could Not Aprove Application");
				}

				return res.redirect('/admin/project-applications/project/' + projectID);
			});
		}
	});
});

router.get('/reject/:aid/project/:pid', function (req, res, next) {

	var applicationID = req.sanitize(req.params.aid);
	var projectID = req.sanitize(req.params.pid);

	projectsModel.find({ _id: projectID, instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate("Could Not Find Project");
		}

		if (projects.length == 0) {

			return res.status(403).end();

		} else {

			applicationsModel.update({ _id: applicationID, project: projectID }, { $set: { status: "R" } }, function (err, num) {

				if (err) {
					console.log(err);
					return res.terminate("Could Not Aprove Application");
				}

				return res.redirect('/admin/project-applications/project/' + projectID);
			});
		}
	});
});

router.get('/undo/:aid/project/:pid', function (req, res, next) {

	var applicationID = req.sanitize(req.params.aid);
	var projectID = req.sanitize(req.params.pid);

	projectsModel.find({ _id: projectID, instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate("Could Not Find Project");
		}

		if (projects.length == 0) {

			return res.status(403).end();

		} else {

			applicationsModel.update({ _id: applicationID, project: projectID }, { $set: { status: "P" } }, function (err, num) {

				if (err) {
					console.log(err);
					return res.terminate("Could Not Aprove Application");
				}

				return res.redirect('/admin/project-applications/project/' + projectID);
			});
		}
	});
});

module.exports = router;
