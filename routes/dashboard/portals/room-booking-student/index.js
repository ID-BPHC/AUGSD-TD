var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var roomsModel = fq('schemas/rooms');
var bookingsModel = fq('schemas/room-bookings');
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
            res.renderState('custom_errors', {
                message: "An unexpected error occoured",
                details: "Contact Instruction Division software team for assistance"
            });
        }

        if (rooms.length == 0) {
            res.renderState('custom_errors', {
                message: "No room with given capacity",
                details: "Try booking multiple rooms with smaller capacity"
            });
        }

        rooms.forEach(function(room, index) {

            room.availible = true;

            if (startHour >= 0 && startHour <= 9) {
                for (i = startHour; i <= endHour; i++) {

                    if (room.fixedClasses[weekDay][i] !== '') {
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
                    }
                }, function(err, results) {

                    if (err) {
                        res.renderState('custom_errors', {
                            message: "An unexpected error occoured",
                            details: "Contact Instruction Division software team for assistance"
                        });
                    }

                    if (results.length != 0) {
                        room.availible = false;
                    }

                });
            }

        });

        res.renderState('dashboard/portals/room-booking-student/step2', {
            rooms: rooms
        });
    });

});


module.exports = router;