var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var coursesModel = fq('schemas/courses');
var divisionsModel = fq('schemas/divisions');
var taModel = fq('schemas/ta');

router.post('/division/apply', function(req, res, next){

	var email = req.user.email;
	var cgpa = req.sanitize(req.body.cgpa);
	var division = req.sanitize(req.body.division);
	var hours = req.sanitize(req.body.hours);


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

router.get('/', function (req, res, next) {
	res.renderState('dashboard/portals/ta-application');
});

module.exports = router;
