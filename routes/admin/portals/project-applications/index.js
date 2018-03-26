var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

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
			applicationsModel.find({ project: project._id }, function (err, applications) {

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

module.exports = router;
