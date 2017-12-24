var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomsModel = fq('schemas/rooms');
var bookingsModel = fq('schemas/room-bookings');
var mailer = fq('utils/mailer');
var moment = require('moment');

var weekDayHash = {
    "Mon": 0,
    "Tue": 1,
    "Wed": 2,
    "Thu": 3,
    "Fri": 4,
    "Sat": 5,
    "Sun": 6
};

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
    bookingsModel.find({
        start: {
            "$gt": new moment()
        },
        bookedBy: req.user.email
    }, function(err, bookings) {
        if (err) {
            return res.terminate(err);
        }

        res.renderState('dashboard/portals/room-booking-student/view', {
            bookings: bookings
        });


    });
});

router.get('/cancel/:id', function(req, res, next) {
    bookingsModel.remove({
        _id: req.params.id,
        bookedBy: req.user.email
    }, function(err) {
        if (err) {
            return res.terminate(err);
        }
        res.redirect('/dashboard/room-booking-student/view');
    });
});


// POST Requests

router.post('/step-2', function(req, res, next) {

    var weekDay = parseInt(weekDayHash[(req.sanitize(req.body.date)).substring(0, 3)]);
    var startHour = parseInt(req.sanitize(req.body['time-start']).substring(0, 2)) - 8;
    var endHour = parseInt(req.sanitize(req.body['time-end']).substring(0, 2)) - 8;

    let roomRegularSearch = roomsModel.find({
        lectureCapacity: {
            $gt: parseInt(req.sanitize(req.body.capacity))
        }
    }).lean().exec(function(err, rooms) {

        if (err) {
            return res.terminate(err);
        }

        if (rooms.length == 0) {
            res.renderState('custom_errors', {
                message: "No room with given capacity",
                details: "Try booking multiple rooms with smaller capacity",
                redirect: '/dashboard/room-booking-student/step-1',
                timeout: 5
            });
        }

        rooms.forEach(function(room, index) {

            room.availible = true;

            if (startHour >= 0 && startHour <= 9) {
                for (i = startHour; i <= endHour; i++) {

                    if (typeof room.fixedClasses[weekDay][i] !== 'undefined' && room.fixedClasses[weekDay][i] !== '') {
                        room.availible = false;
                        break;
                    }
                }
            }
        });
        return rooms;
    });

    roomRegularSearch.then(function(rooms) {

        var startTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-start']), 'ddd DD MMM YYYY HH:mm').toDate();
        var endTime = new moment(req.sanitize(req.body.date) + " " + req.sanitize(req.body['time-end']), 'ddd DD MMM YYYY HH:mm').toDate();

        console.log(typeof startTime + " " + typeof d + ' ' + startTime.toString());
        rooms.forEach(function(room, index) {

            if (room.availible) {
                bookingsModel.find({
                    number: room.number,
                    start: {
                        "$lt": endTime
                    },
                    end: {
                        "$gt": startTime
                    },
                    approval: {
                        "$ne": "R"
                    }
                }, function(err, results) {

                    if (err) {
                        return res.terminate(err);
                    }

                    if (results.length != 0) {
                        room.availible = false;
                    }

                });
            }

        });

        req.session.rooms = rooms;
        req.session.startTime = startTime;
        req.session.endTime = endTime;
        req.session.av = req.sanitize(req.body.av) == "Yes" ? true : false;
        req.session.purpose = req.sanitize(req.body.purpose);
        req.session.phone = req.sanitize(req.body.phone);
        req.session.save();

        res.renderState('dashboard/portals/room-booking-student/step2', {
            rooms: rooms
        });
    });

});

router.post('/step-3', function(req, res, next) {

    var room = req.sanitize(req.body.room);

    req.session.rooms.forEach(function(roomL, index) {

        if (roomL.number == room && roomL.availible) {

            bookingsModel.find({
                number: room,
                start: {
                    "$lt": req.session.endTime
                },
                end: {
                    "$gt": req.session.startTime
                }
            }, function(err, results) {

                if (err) {
                    return res.terminate(err);
                }

                if (results.length == 0) {
                    bookingsModel.create({
                        number: room,
                        start: req.session.startTime,
                        end: req.session.endTime,
                        bookedBy: req.user.email,
                        av: req.session.av,
                        purpose: req.session.purpose,
                        phone: req.session.phone,
                        approval: "P"

                    }, function(err, result) {
                        if (err) {
                            return res.terminate(err);
                        }
                        mailer.send({
                            email: req.user.email,
                            subject: "Room Booking",
                            body: "Your request for room booking has been initiated. Please wait for approval. <br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" + room + "</td></tr><tr><td><b>From</b></td><td>" + result.start.toString() + "</td></tr><tr><td><b>To</b></td><td>" + result.end.toString() + "</td></tr></table>"
                        });
                        res.renderState('dashboard/portals/room-booking-student/step3', {
                            number: room,
                            start: result.start.toString(),
                            end: result.end.toString(),
                            phone: req.session.phone,
                            av: req.session.av
                        });
                    });
                } else {
                    res.renderState('custom_errors', {
                        message: "Oops.. Room already booked.",
                        details: "Someone else booked this room while you were booking. Please book some other room.",
                        redirect: '/dashboard/room-booking-student/step-1',
                        timeout: 5
                    });
                }

            });

        }
    });

});


module.exports = router;