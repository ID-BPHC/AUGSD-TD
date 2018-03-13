var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var feedbacksModel = fq('schemas/feedbacks-midsem');
var adminsModel = fq('schemas/admins');

router.get('/midsem', function (req, res, next) {
    try {
        feedbacksModel.find({}, (err, feedbacks) => {
            if (err) {
                return res.terminate(err);
            }
            feedbacks.forEach(element => {
                for(i=0; i<3; i++)
                element.responses[i] = element.responses[i].substring(0, Math.min(element.responses[i].length, 66)) + " ...";
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
                res.renderState('admin/portals/feedbacks-admin/midsem', {
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


router.get('/midsem/view/:id', function (req, res, next) {
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
                        for(i=0; i<3; i++)
                        element.responses[i] = element.responses[i].substring(0, Math.min(element.responses.length[i], 66)) + " ...";
                    });

                    res.renderState('admin/portals/feedbacks-admin/midsem/view', {
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

router.get('/midsem/view/:id/feedback/:fid', function (req, res, next) {
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
                        res.renderState('admin/portals/feedbacks-admin/midsem/fview', {
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