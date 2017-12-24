var express = require('express');
var router = express.Router();

var auth = require('../../middleware/auth');

var studentsModel = require('../../schemas/students');
var coursesModel = require('../../schemas/courses');
var adminsModel = require('../../schemas/admins');
var feedbacksModel = require('../../schemas/feedbacks');

router.use(function(req, res, next) {
    if (!(req.user)) {
        let response = {
            code: 401,
            message: "Unauthorized"
        };
        res.json(response);
    } else {
        next();
    }
});

router.get('/getCourses', function(req, res, next) {
    if (req.session.userType === "user") {
        // console.log(req.session);
        studentsModel.find({
            email: req.session.passport.user,
        }, {
            name: 0,
            idNumber: 0,
            _id: 0,
            email: 0
        }, function(err, result) {
            if (err) {}
            res.json(result[0]);
        });
    } else {
        let response = {
            code: 401,
            message: "Unauthorized"
        };
        res.json(response);
    }
});

router.get('/getCourse/:course/:section', function(req, res, next) {
    if (req.session.userType === "user") {
        // console.log(req.session);
        let query = coursesModel.aggregate({
            $match: {
                $and: [{
                    courseID: req.params.course
                }, {
                    'sections.section': req.params.section
                }]
            }
        }, {
            $project: {
                sections: {
                    $filter: {
                        input: '$sections',
                        as: 'item',
                        cond: {
                            $eq: ['$$item.section', req.params.section]
                        }
                    }
                },
                _id: 0
            }
        }, function(err, result) {
            if (err) {
                return res.terminate(err);
            }
            let instructors = result[0].sections[0].instructors;
            let promises = [];
            instructors.forEach(element => {
                promises.push(getInstructorName(element));
            });
            let finalresult = result;
            Promise.all(promises).then(data => res.json({
                instructors: data
            }));
        });
    } else {
        let response = {
            code: 401,
            message: "Unauthorized"
        };
        res.json(response);
    }
});

router.get('/getFeedback/:email/:skip', function(req, res, next) {
    if (req.session.userType === "adminSuper") {
        Promise.all([getInstructorFeedback(req.params.email, req.params.skip)]).then(data => res.json({
            feedback: data[0]
        }));
    } else if (req.session.userType === "admin") {
        Promise.all([getInstructorFeedback(req.session.passport.user, req.params.skip)]).then(data => res.json({
            feedback: data[0]
        }));
    } else {
        let response = {
            code: 401,
            message: "Unauthorized"
        };
        res.json(response);
    }
});

let getInstructorName = function(email) {
    return new Promise((resolve, reject) => {
        adminsModel.find({
            email: email
        }, function(err, email) {
            if (err) {
                reject(err);
            }
            let newdata = {
                name: email[0].name,
            };
            // console.log(newdata);
            resolve(newdata);
        });
    });
};

let getInstructorFeedback = function(email, skip) {
    return new Promise((resolve, reject) => {
        feedbacksModel.aggregate({
                $match: {
                    instructor: email
                }
            }, {
                "$project": {
                    _id: 0,
                    type: 0,
                    instructor: 0,
                    student: 0,
                    __v: 0
                }
            }, {
                "$group": {
                    "_id": null,
                    "count": {
                        "$sum": 1
                    },
                    "docs": {
                        "$push": "$$ROOT"
                    }
                }
            }, {
                "$unwind": "$docs"
            }, {
                "$skip": skip * 20
            }, {
                "$limit": 20
            }, {
                "$group": {
                    "_id": "$_id",
                    "count": {
                        "$first": "$count"
                    },
                    "docs": {
                        "$push": "$docs"
                    }
                }
            },
            function(err, feedback) {
                if (err) {
                    reject(err);
                }
                resolve(feedback);
            });
    });
};

module.exports = router;