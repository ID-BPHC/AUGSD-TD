var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/ta-application');
});

router.get('/division', function(req, res, next) {
    res.renderState('dashboard/portals/ta-application/apply-division', {
        type: "division"
    });
});

router.get('/course', function(req, res, next) {
    res.renderState('dashboard/portals/ta-application/apply-course', {
        type: "course"
    });
});

module.exports = router;