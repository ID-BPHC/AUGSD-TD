var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student');
});

module.exports = router;