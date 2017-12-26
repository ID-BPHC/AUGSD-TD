var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var coursesModel = fq('schemas/courses');
var divisionsModel = fq('schemas/divisions');

router.get('/', function (req, res, next) {
	res.renderState('dashboard/portals/ta-application');
});

router.get('/division', function (req, res, next) {
	divisionsModel.find({}).sort({ name: 1 }).exec(function (err, divisions) {
		if (err) {
			res.terminate(err);
		}
		res.renderState('dashboard/portals/ta-application/apply-division', {
			divisions: divisions
		});
	});
});

router.get('/course', function (req, res, next) {

	coursesModel.find({}).sort({
		courseID: 1
	}).exec(function (err, courses) {
		if (err) {
			res.terminate(err);
		}
		res.renderState('dashboard/portals/ta-application/apply-course', {
			courses: courses
		});
	});
});

module.exports = router;
