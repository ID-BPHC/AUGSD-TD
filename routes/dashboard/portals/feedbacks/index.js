var express = require('express');
var filter = require('profanity-filter');
var badwordslist = require('badwords-list');
var fq = require('fuzzquire');
var mailer = fq('utils/mailer');
var router = express.Router();

var coursesModel = require('../../../../schemas/courses');
var adminsModel = require('../../../../schemas/admins');
var studentsModel = require('../../../../schemas/students');
var feedbacksModel = require('../../../../schemas/feedbacks');

router.get('/step-1', function(req, res, next) {
    res.renderState('dashboard/portals/feedbacks/step1');
});

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/feedbacks');
});

['/', '/step-2', '/step-3'].forEach((step) => {
    router.get(step, (req, res, next) => {
        res.renderState('dashboard/portals/feedbacks');
    });
});

let errorHandler = function(req, res, message) {
    let link = req.originalUrl.split('/');
    return res.renderState('custom_errors', {
        redirect: link[0] + "/" + link[1] + "/" + link[2] + "/step-1",
        timeout: 2,
        supertitle: ".",
        callback: "/",
        message: "Validation Error",
        details: message
    });
};

router.post('/step-2', function(req, res, next) {
    try {
        if (req.sanitize(req.body.courselist) == '. . .') {
            errorHandler(req, res, "Invalid course selected. Please select a valid course.");
        }

        let courseSearch = coursesModel.find({
            courseID: req.sanitize(req.body.courselist)
        }, function(err, result) {
            if (err) {
                return res.terminate(err);
            }
            return result;
        });
        courseSearch.then(function retrieveStudent(data) {
            let coursedata = req.user.courses;
            for (let i = 0; i < coursedata.length; i++) {
                if (coursedata[i].courseID == data[0].courseID) {
                    return req.user.courses[i].sections;
                }
            }
        }).then(function saveCourseID(data) {
            req.session.courseID = req.sanitize(req.body.courselist);
            req.session.save();
            return data;
        }).then(function renderStep(data) {
            res.renderState('dashboard/portals/feedbacks/step2', {
                params: data,
                courseID: req.sanitize(req.body.courselist)
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.post('/step-3', function(req, res, next) {
    try {
        if (req.sanitize(req.body.courselist) == '. . .') {
            errorHandler(req, res, "Invalid Class Selected. Please select a valid class.");
        }

        let courseSection = req.sanitize(req.body.courselist).split("-")[1].replace(" ", "");
        req.session.courseSection = courseSection;
        req.session.save();
        let courseSearch = coursesModel.aggregate([{
            $match: {
                $and: [{
                    courseID: req.session.courseID
                }, {
                    'sections.section': courseSection
                }]
            }
        }, {
            $project: {
                sections: {
                    $filter: {
                        input: '$sections',
                        as: 'item',
                        cond: {
                            $eq: ['$$item.section', courseSection]
                        }
                    }
                },
                _id: 0
            }
        }]);
        courseSearch.then(function getInstructorName(data) {
            let newdata = {
                instructors: []
            };

            function getInstructorNameProcedure(i) {
                return new Promise((resolve, reject) => {
                    adminsModel.find({
                        email: data[0].sections[0].instructors[i]
                    }, function(err, email) {
                        if (err) {
                            return res.terminate(err);
                        }
                        newdata.instructors[i] = {
                            name: email[0].name,
                            email: data[0].sections[0].instructors[i]
                        };
                        resolve(newdata);
                    });
                });
            }
            let promises = [];
            for (let i = 0; i < data[0].sections[0].instructors.length; i++) {
                promises.push(getInstructorNameProcedure(i));
            }
            return Promise.all(promises);
        }).then(function saveInstructorData(data) {
            req.session.instructor = data;
            req.session.save();
            return data;
        }).then(function renderStep(data) {
            let link = req.originalUrl.split('/');
            res.renderState('dashboard/portals/' + link[2] + '/step3', {
                params: data[0].instructors,
                courseID: req.session.courseID,
                courseSection: req.session.courseSection
            });
        });
    } catch (err) {
        console.log(err);
        return res.terminate(err);
    }
});

module.exports = router;