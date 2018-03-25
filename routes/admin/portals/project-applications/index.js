var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

var projectsModel = fq('schemas/projects');

router.get('/', function (req, res, next) {
	projectsModel.find({ instructor: req.sanitize(req.user.email) }, function (err, projects) {

		if (err) {
			console.log(err);
			return res.terminate("Could not find projects");
		}

		return res.renderState('admin/portals/project-applications', {
			projects: projects
		});
	});
});

router.get('/project/:id', function (req, res, next) {
	res.send("applications");
});

module.exports = router;
