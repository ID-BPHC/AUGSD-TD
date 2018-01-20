var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomBookingStudent = fq('middleware/room-booking');
var moment = require('moment');

const { check, validationResult } = require('express-validator/check');

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
    roomBookingStudent.view(req.sanitize(req.user.email), function(err, bookings) {
        if (err) {
            return res.terminate("Error");
        }
        res.renderState('room-booking/view', {
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

router.post('/step-2', [
        check('capacity').exists().withMessage('No Capacity').isNumeric().withMessage('Invalid Capacity').not().isEmpty().withMessage('No Capacity'),
        check('purpose').exists().withMessage('No Purpose').not().isEmpty().withMessage('No Purpose'),
        check('date').exists().withMessage('No Date').not().isEmpty().withMessage('No Date Specified'),
        check('phone').exists().withMessage('No Phone').isNumeric().withMessage('Invalid Phone').isLength({ min: 10, max: 10 }).withMessage('Invalid Phone').not().isEmpty().withMessage('No Phone'),
        check('av').exists().withMessage('No AV Value').isIn(['Yes', 'No']).withMessage('Invalid AV Value')
    ], function(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.renderState('form-errors', { errors: errors.mapped() });
    }

    var startTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-start']), 'ddd DD MMM YYYY HH:mm').toDate();
    var endTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-end']), 'ddd DD MMM YYYY HH:mm').toDate();

    if(endTime < startTime) {
        return res.renderState('custom_errors', {
                redirect: "/dashboard/room-booking-student/step-1",
                timeout: 5,
                supertitle: "Time Error",
                message: "End Time was chosen before Start Time",
            });
    }
    
    roomBookingStudent.getRooms(req.sanitize(req.body.date), req.sanitize(req.body['time-start']), req.sanitize(req.body['time-end']), req.sanitize(req.body.capacity), false, false, function(err, rooms) {

        if (err) {
            return res.terminate("Error");
        }

        if (rooms.high == 1) {
            return res.renderState('custom_errors', {
                message: "No room with given capacity",
                details: "Try booking multiple rooms with smaller capacity",
                redirect: '/dashboard/room-booking-student/step-1',
                timeout: 5
            });
        }
        
        if (rooms.bookingOnHolidaySameDay == 1) {
            return res.renderState('custom_errors', {
                message: "Holiday",
                details: "You can not book a room on a holiday for a holiday :P",
                redirect: '/admin/room-booking-faculty/step-1',
                timeout: 5
            });
        }

        if (rooms.bookingAfterFourSameDay == 1 || rooms.bookingAfterNoonSameDay == 1) {
            return res.renderState('custom_errors', {
                message: "Office Hours Closed",
                details: "You can not book a room for the same day after office hours.",
                redirect: '/admin/room-booking-faculty/step-1',
                timeout: 5
            });
        }

        if (rooms.bookingAfterFourNextDay == 1 || rooms.bookingAfterNoonNextDay == 1) {
            return res.renderState('custom_errors', {
                message: "Office Hours Closed",
                details: "You can not book a room for next day (holiday) after office hours.",
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

    roomBookingStudent.makeBooking(room, req.session.rooms, req.session.endTime, req.session.startTime, req.user.email, req.session.av, req.session.purpose, req.session.phone, false, function(err, result) {
        if (err) {
            return res.terminate("Error");
        }

        if (result.alreadyBooked == 1) {
            return res.renderState('custom_errors', {
                message: "Oops.. Room already booked.",
                details: "Someone else booked this room while you were booking. Please book some other room.",
                redirect: '/dashboard/room-booking-student/step-1',
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