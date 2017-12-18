var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomsSchema = fq('schemas/rooms');

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student');
});

router.get('/step-1', function(req, res, next){
	res.renderState('dashboard/portals/room-booking-student/step1');
});

router.get('/step-2', function(req, res, next){
	res.renderState('dashboard/portals/room-booking-student');
});

router.get('/step-3', function(req, res, next){
	res.renderState('dashboard/portals/room-booking-student');
});



module.exports = router;