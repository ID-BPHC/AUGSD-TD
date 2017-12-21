var express = require('express');
var filter = require('profanity-filter');
var badwordslist = require('badwords-list');
var router = express.Router();

var coursesModel = require('../../../../schemas/courses');
var adminsModel = require('../../../../schemas/admins');
var studentsModel = require('../../../../schemas/students');
var feedbacksModel = require('../../../../schemas/feedbacks');

router.get('/', function (req, res, next) {
    res.renderState('dashboard/portals/feedbacks-24x7');
});

router.get('/step-1', function (req, res, next) {
    res.renderState('dashboard/portals/feedbacks-24x7/step1');
});

router.get('/step-2', function (req, res, next) {
    res.redirect('/dashboard/feedbacks-24x7');
});

router.get('/step-3', function (req, res, next) {
    res.redirect('/dashboard/feedbacks-24x7');
});

router.post('/step-2', function (req, res, next) {
    let courseSearch = coursesModel.find({
        courseID: req.sanitize(req.body.courselist)
    }, function (err, result) {
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
        res.renderState('dashboard/portals/feedbacks-24x7/step2', {
            params: data,
            courseID: req.sanitize(req.body.courselist)
        });
    });
});

router.post('/step-3', function (req, res, next) {
    let courseSection = req.sanitize(req.body.courselist).split("-")[1].replace(" ", "");
    req.session.courseSection = courseSection;
    req.session.save();
    let courseSearch = coursesModel.aggregate({
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
    });
    courseSearch.then(function getInstructorName(data) {
        let newdata = {
            instructors: []
        };

        function getInstructorNameProcedure(i) {
            return new Promise((resolve, reject) => {
                adminsModel.find({
                    email: data[0].sections[0].instructors[i]
                }, function (err, email) {
                    if (err) {
                        return reject(err);
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
        res.renderState('dashboard/portals/feedbacks-24x7/step3', {
            params: data[0].instructors,
            courseID: req.session.courseID,
            courseSection: req.session.courseSection
        });
    });
});

router.post('/step-4', function (req, res, next) {
    let instructorarray = req.session.instructor[0].instructors;
    let courseID = req.session.courseID;
    let courseSection = req.session.courseSection;
    let instructorname = req.sanitize(req.body.instructorlist);
    let feedback = req.sanitize(req.body.feedback);
    let instructoremail = '';
    instructorarray.forEach(function (element) {
        if (element.name == instructorname) {
            instructoremail = element.email;
        }
    });
    filter.setReplacementMethod('grawlix');
    badwordslist.array.forEach(function (item) {
        filter.addWord(item);
        filter.addWord(item.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }));
        filter.addWord(item.toUpperCase());
    });
    let customfilter = [];
    customfilter.forEach(function (item) {
        filter.addWord(item);
    });
    filter.setGrawlixChars(['']);
    feedback = filter.clean(feedback);
    console.log(feedback);
    let dataStore = {
        courseID: courseID,
        section: courseSection,
        instructor: instructoremail, // Instructor's email
        type: "24x7", // 24x7 or midsem
        responses: feedback,
        student: req.session.passport.user
    };
    feedbacksModel.create(dataStore, function (err, response) {
        if (err) {
            res.renderState('custom_errors', {
                redirect: "/dashboard",
                timeout: 5,
                supertitle: "Couldn't submit feedback",
                message: "Failure",
                details: err
            });
        }
        res.renderState('custom_errors', {
            redirect: "/dashboard",
            timeout: 2,
            supertitle: "Submitted Feedback.",
            message: "Success",
            details: "Stored Feedback. Redirecting"
        });
    });
});
module.exports = router;