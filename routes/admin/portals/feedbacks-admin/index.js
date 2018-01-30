var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var feedbacksModel = fq('schemas/feedbacks');
var adminsModel = fq('schemas/admins');

router.get('/24x7', function (req, res, next) {
    try {
        feedbacksModel.find({}, (err, feedbacks) => {
            if (err) {
                return res.terminate(err);
            }
            feedbacks.forEach(element => {
                element.responses = element.responses.substring(0, Math.min(element.responses.length, 66)) + " ...";
            });
            adminsModel.find({
                superUser: false
            }, {
                __v: 1,
                name: 1
            }, {
                sort: {
                    name: 1
                }
            }, (err, result) => {
                if (err) {
                    return res.terminate(err);
                }
                res.renderState('admin/portals/feedbacks-admin/24x7', {
                    profs: result,
                    results: {
                        feedbacks: feedbacks
                    }
                });
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/', function (req, res, next) {
    res.renderState('admin/portals/feedbacks-admin');
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


router.get('/24x7/view/:id', function (req, res, next) {
    try {
        adminsModel.findOne({
            _id: req.sanitize(req.params.id)
        }, {
            name: 1,
            email: 1
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            if (result != null && result != undefined) {
                feedbacksModel.find({
                    instructor: result.email
                }, (err, feedbacks) => {
                    if (err) {
                        return res.terminate(err);
                    }

                    feedbacks.forEach(element => {
                        element.responses = element.responses.substring(0, Math.min(element.responses.length, 66)) + " ...";
                    });

                    res.renderState('admin/portals/feedbacks-admin/24x7/view', {
                        results: {
                            id: result._id,
                            name: result.name,
                            email: result.email,
                            feedback: feedbacks
                        }
                    });
                });
            }
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/24x7/view/:id/feedback/:fid', function (req, res, next) {
    try {
        feedbacksModel.findOne({
            _id: req.sanitize(req.params.fid)
        }, (err, feedbacks) => {
            if (err) {
                return res.terminate(err);
            }
            if (feedbacks != null && feedbacks != undefined) {
                adminsModel.findOne({
                    email: feedbacks.instructor
                }, {
                    name: 1,
                }, (err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    if (result != null && result != undefined) {
                        res.renderState('admin/portals/feedbacks-admin/24x7/fview', {
                            results: {
                                name: result.name,
                                feedback: feedbacks
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/24x7/view/feedback/:fid', function (req, res, next) {
    try {
        feedbacksModel.findOne({
            _id: req.sanitize(req.params.fid)
        }, (err, feedbacks) => {
            if (err) {
                return res.terminate(err);
            }
            if (feedbacks != null && feedbacks != undefined) {
                adminsModel.findOne({
                    email: feedbacks.instructor
                }, {
                    name: 1,
                }, (err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    if (result != null && result != undefined) {
                        res.renderState('admin/portals/feedbacks-admin/24x7/fview', {
                            results: {
                                name: result.name,
                                feedback: feedbacks
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        return res.terminate(err);
    }
});

module.exports = router;