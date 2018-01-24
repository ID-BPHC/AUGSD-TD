var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var feedbacksModel = fq('schemas/feedbacks');
var adminsModel = fq('schemas/admins');

router.get('/', function (req, res, next) {
    adminsModel.find({
        email: req.session.passport.user
    }, {
        __v: 0
    }, (err, result) => {
        if (err) {
            return res.terminate(err);
        }
        if (result.superUser == false) {
            feedbacksModel.find({
                    instructor: req.session.passport.user
                }, {
                    __v: 0
                }, {
                    sort: {
                        createdOn: -1
                    }
                },
                (err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    result.forEach((object, index, array) => {
                        array[index].createdOn = getUTCDate(Number(array[index].createdOn));
                        array[index].responses = array[index].responses.substring(0, Math.min(array[index].responses.length, 66)) + " ...";
                    });
                    res.renderState('admin/portals/feedbacks-prof', {
                        feedbacks: result
                    });
                });
        } else {
            feedbacksModel.find({}, {
                    __v: 0
                }, {
                    sort: {
                        createdOn: -1
                    }
                },
                (err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    result.forEach((object, index, array) => {
                        array[index].createdOn = getUTCDate(Number(array[index].createdOn));
                        array[index].responses = array[index].responses.substring(0, Math.min(array[index].responses.length, 66)) + " ...";
                    });
                    res.renderState('admin/portals/feedbacks-prof', {
                        feedbacks: result
                    });
                });
        }
    });
});

function getUTCDate(epoch) {
    let utcDate = new Date(epoch);
    let date = new Date();
    date.setUTCDate(utcDate.getDate());
    date.setUTCHours(utcDate.getHours());
    date.setUTCMonth(utcDate.getMonth());
    date.setUTCMinutes(utcDate.getMinutes());
    date.setUTCSeconds(utcDate.getSeconds());
    date.setUTCMilliseconds(utcDate.getMilliseconds());
    return date.toLocaleDateString('en-US');
}


router.get('/view/:id', function (req, res, next) {
    adminsModel.find({
        email: req.session.passport.user
    }, {
        __v: 0
    }, (err, result) => {
        if (err) {
            return res.terminate(err);
        }
        if (result.superUser == false) {
            feedbacksModel.findOne({
                _id: req.sanitize(req.params.id),
                instructor: req.session.passport.user
            }, (err, result) => {
                if (err) {
                    return res.terminate(err);
                }
                res.renderState('admin/portals/feedbacks-prof/view', {
                    feedback: result
                });
            });
        } else {
            feedbacksModel.findOne({
                _id: req.sanitize(req.params.id)
            }, (err, result) => {
                if (err) {
                    return res.terminate(err);
                }
                res.renderState('admin/portals/feedbacks-prof/view', {
                    feedback: result
                });
            });
        }
    });
});

module.exports = router;