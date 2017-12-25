var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomBookingStudent = fq('middleware/room-booking');
var moment = require('moment');

// GET Requests

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student');
});

router.get('/step-1', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student/step1');
});

router.get('/step-2', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student');
});

router.get('/step-3', function(req, res, next) {
    res.renderState('dashboard/portals/room-booking-student');
});

router.get('/view', function(req, res, next) {
    roomBookingStudent.view(req.sanitize(req.user.email), function(err, bookings) {
        if (err) {
            return res.terminate("Error");
        }
        res.renderState('dashboard/portals/room-booking-student/view', {
            bookings: bookings
        });
    });
});

router.get('/cancel/:id', function(req, res, next) {
    roomBookingStudent.cancel(req.sanitize(req.params.id), req.sanitize(req.user.email), function(err) {
        if (err) {
            return res.terminate("Error");
        }
        res.redirect('/dashboard/room-booking-student/view');
    });
});


// POST Requests

router.post('/step-2', function(req, res, next) {

    var startTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-start']), 'ddd DD MMM YYYY HH:mm').toDate();
    var endTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-end']), 'ddd DD MMM YYYY HH:mm').toDate();

    roomBookingStudent.getRooms(req.sanitize(req.body.date), req.sanitize(req.body['time-start']), req.sanitize(req.body['time-end']), req.sanitize(req.body.capacity), false, false, function(err, rooms) {

        if (err) {
            return res.terminate("Error");
        }

        if (rooms.high == 1) {
            res.renderState('custom_errors', {
                message: "No room with given capacity",
                details: "Try booking multiple rooms with smaller capacity",
                redirect: '/dashboard/room-booking-student/step-1',
                timeout: 5
            });
        }

        req.session.rooms = rooms;
        req.session.startTime = startTime;
        req.session.endTime = endTime;
        req.session.av = req.sanitize(req.body.av) == "Yes" ? true : false;
        req.session.purpose = req.sanitize(req.body.purpose);
        req.session.phone = req.sanitize(req.body.phone);
        req.session.save();

        res.nocache();
        res.renderState('dashboard/portals/room-booking-student/step2', {
            rooms: rooms
        });
    });
});

router.post('/step-3', function(req, res, next) {

    var room = req.sanitize(req.body.room);

    roomBookingStudent.makeBooking(room, req.session.rooms, req.session.endTime, req.session.startTime, req.user.email, req.session.av, req.session.purpose, req.session.phone, false, function(err, result) {
        if (err) {
            return res.terminate("Error");
        }

        if (result.alreadyBooked == 1) {
            res.renderState('custom_errors', {
                message: "Oops.. Room already booked.",
                details: "Someone else booked this room while you were booking. Please book some other room.",
                redirect: '/dashboard/room-booking-student/step-1',
                timeout: 5
            });
        }

        res.renderState('dashboard/portals/room-booking-student/step3', {
            number: room,
            start: result.start.toString(),
            end: result.end.toString(),
            phone: req.session.phone,
            av: req.session.av
        });
    });
});

module.exports = router;