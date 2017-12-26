var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var coursesModel = fq('schemas/courses');

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/ta-application');
});

router.get('/division', function(req, res, next) {
    res.renderState('dashboard/portals/ta-application/apply-division');
});

router.get('/course', function(req, res, next) {

    coursesModel.find({}).sort({
        courseID: 1
    }).exec(function(err, courses) {
        res.renderState('dashboard/portals/ta-application/apply-course', {
            courses: courses
        });
    });
});

module.exports = router;