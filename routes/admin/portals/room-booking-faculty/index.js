var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomBookingFaculty = fq('middleware/room-booking');
var moment = require('moment');

// GET Requests

router.get('/', function(req, res, next) {
    res.renderState('room-booking');
});

router.get('/step-1', function(req, res, next) {
    res.renderState('room-booking/step1');
});

router.get('/step-2', function(req, res, next) {
    res.renderState('room-booking');
});

router.get('/step-3', function(req, res, next) {
    res.renderState('room-booking');
});

router.get('/view', function(req, res, next) {
    roomBookingFaculty.view(req.sanitize(req.user.email), function(err, bookings) {
        if (err) {
            return res.terminate("Error");
        }
        res.renderState('room-booking/view', {
            bookings: bookings
        });
    });
});

router.get('/cancel/:id', function(req, res, next) {
    roomBookingFaculty.cancel(req.sanitize(req.params.id), req.sanitize(req.user.email), function(err) {
        if (err) {
            return res.terminate("Error");
        }
        res.redirect('/admin/room-booking-faculty/view');
    });
});


// POST Requests

router.post('/step-2', function(req, res, next) {

    var startTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-start']), 'ddd DD MMM YYYY HH:mm').toDate();
    var endTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-end']), 'ddd DD MMM YYYY HH:mm').toDate();
    var exam = (req.sanitize(req.body.le) == "Yes") ? true : false;

    roomBookingFaculty.getRooms(req.sanitize(req.body.date), req.sanitize(req.body['time-start']), req.sanitize(req.body['time-end']), req.sanitize(req.body.capacity), exam, true, function(err, rooms) {

        if (err) {
            return res.terminate("Error");
        }

        if (rooms.high == 1) {
            return res.renderState('custom_errors', {
                message: "No room with given capacity",
                details: "Try booking multiple rooms with smaller capacity",
                redirect: '/admin/room-booking-faculty/step-1',
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
        res.renderState('room-booking/step2', {
            rooms: rooms
        });
    });
});

router.post('/step-3', function(req, res, next) {

    var room = req.sanitize(req.body.room);

    roomBookingFaculty.makeBooking(room, req.session.rooms, req.session.endTime, req.session.startTime, req.user.email, req.session.av, req.session.purpose, req.session.phone, true, function(err, result) {
        if (err) {
            return res.terminate("Error");
        }

        if (result.alreadyBooked == 1) {
            return res.renderState('custom_errors', {
                message: "Oops.. Room already booked.",
                details: "Someone else booked this room while you were booking. Please book some other room.",
                redirect: '/admin/room-booking-faculty/step-1',
                timeout: 5
            });
        }

        res.renderState('room-booking/step3', {
            number: room,
            start: result.start.toString(),
            end: result.end.toString(),
            phone: req.session.phone,
            av: req.session.av
        });
    });
});

module.exports = router;