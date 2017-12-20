var express = require('express');
var router = express.Router();

var auth = require('../../middleware/auth');

var studentsModel = require('../../schemas/students');
var coursesModel = require('../../schemas/courses');
var adminsModel = require('../../schemas/admins');

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
        })
    });
};

module.exports = router;