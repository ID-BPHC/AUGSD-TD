var fq = require('fuzzquire');
var mongoose = require('mongoose');
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

// Returns all the future bookings made by a user
let view = function(email, callback) {
    bookingsModel.find({
        start: {
            "$gt": new moment()
        },
        bookedBy: email
    }, function(err, bookings) {
        if (err) {
            console.log(err);
            callback(true, null);
        }
        callback(false, bookings);
    });
};

// To cancel a booking using object id and email
let cancel = function(id, email, callback) {
    bookingsModel.remove({
        _id: mongoose.Types.ObjectId(id),
        bookedBy: email
    }, function(err) {
        if (err) {
            console.log(err);
            callback(true);
        }
        callback(false);
    });
};

//  Gets availible rooms

let getRooms = function(date, timeStart, timeEnd, capacity, bookedForExam, bookedByFaculty, callback) {

    var weekDay = parseInt(weekDayHash[date.substring(0, 3)]);
    var startHour = parseInt(timeStart.substring(0, 2)) - 8;
    var endHour = parseInt(timeEnd.substring(0, 2)) - 8;

    var lecture = (bookedForExam ? 0 : parseInt(capacity));
    var exam = (bookedForExam ? parseInt(capacity) : 0);

    let roomRegularSearch = roomsModel.find({
        lectureCapacity: {
            $gt: lecture
        },
        examCapacity: {
            $gt: exam
        }
    }).lean().exec(function(err, rooms) {

        if (err) {
            console.log(err);
            callback(true, null);
        }

        if (rooms.length == 0) {
            callback(false, {
                high: 1
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

        var startTime = new moment(date + " " + timeStart, 'ddd DD MMM YYYY HH:mm').toDate();
        var endTime = new moment(date + " " + timeEnd, 'ddd DD MMM YYYY HH:mm').toDate();

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
                        console.log(err);
                        callback(true, null);
                    }

                    if (results.length != 0) {
                        room.availible = false;
                    }

                });
            }

        });
        callback(false, rooms);
    });
};

// To make checks and do booking

let makeBooking = function(room, rooms, endTime, startTime, email, av, purpose, phone, bookedByFaculty, callback) {

    rooms.forEach(function(roomL, index) {

        if (roomL.number == room && roomL.availible) {

            bookingsModel.find({
                number: room,
                start: {
                    "$lt": endTime
                },
                end: {
                    "$gt": startTime
                }
            }, function(err, results) {

                if (err) {
                    console.log(err);
                    callback(true, {});
                }

                if (results.length == 0) {
                    bookingsModel.create({
                        number: room,
                        start: startTime,
                        end: endTime,
                        bookedBy: email,
                        av: av,
                        purpose: purpose,
                        phone: phone,
                        approval: (bookedByFaculty ? "A" : "P")

                    }, function(err, result) {
                        if (err) {
                            console.log(err);
                            callback(true, {});
                        }
                        if (!bookedByFaculty) {
                            mailer.send({
                                email: email,
                                subject: "Room Booking",
                                body: "Your request for room booking has been initiated. Please wait for approval. <br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" + room + "</td></tr><tr><td><b>From</b></td><td>" + result.start.toString() + "</td></tr><tr><td><b>To</b></td><td>" + result.end.toString() + "</td></tr></table>"
                            });
                        } else {
                            mailer.send({
                                email: email,
                                subject: "Room Booking",
                                body: "Your request for room booking has been confirmed.<br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" + room + "</td></tr><tr><td><b>From</b></td><td>" + result.start.toString() + "</td></tr><tr><td><b>To</b></td><td>" + result.end.toString() + "</td></tr></table>"
                            });
                        }
                        callback(false, result);
                    });
                } else {
                    callback(false, {
                        alreadyBooked: 1
                    });
                }
            });
        }
    });
};

module.exports = {
    view: view,
    cancel: cancel,
    getRooms: getRooms,
    makeBooking: makeBooking
};