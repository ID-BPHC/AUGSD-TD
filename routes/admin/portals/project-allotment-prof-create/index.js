var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var projectsModel = fq('schemas/projects');

router.get('/', function (req, res, next) {
    try {
        projectsModel.find({
                instructor: req.session.passport.user
            },
            (err, result) => {
                if (err) {
                    return res.terminate(err);
                }
                result.forEach((object, index, array) => {
                    array[index].description = array[index].description.substring(0, Math.min(array[index].description.length, 66)) + " ...";
                });
                res.renderState('admin/portals/project-allotment-prof-create', {
                    projects: result
                });
            });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/view/:id', function (req, res, next) {
    try {
        projectsModel.findOne({
            _id: req.sanitize(req.params.id),
            instructor: req.session.passport.user
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.renderState('admin/portals/project-allotment-prof-create/view', {
                project: result
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.post('/create', function (req, res, next) {
    try {
        let data = {
            title: req.sanitize(req.body.title),
            description: req.sanitize(req.body.description),
            instructor: req.session.passport.user
        };
        projectsModel.create(data, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.redirect('/admin/project-allotment-prof-create');
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/create', function (req, res, next) {
    try {
        res.renderState('admin/portals/project-allotment-prof-create/create');
    } catch (err) {
        return res.terminate(err);
    }
});


router.put('/view/:id', function (req, res, next) {
    try {
        projectsModel.findOne({
            _id: req.sanitize(req.params.id),
            instructor: req.session.passport.user
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.renderState('admin/portals/project-allotment-prof-create/view', {
                project: result
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.delete('/view/:id', function (req, res, next) {
    try {
        projectsModel.findOne({
            _id: req.sanitize(req.params.id),
            instructor: req.session.passport.user
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.redirect('/admin/portals/project-allotment-prof-create');
        });
    } catch (err) {
        return res.terminate(err);
    }
});

module.exports = router;