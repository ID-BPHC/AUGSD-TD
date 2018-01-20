var fq = require('fuzzquire');
var mongoose = require('mongoose');
var roomsModel = fq('schemas/rooms');
var bookingsModel = fq('schemas/room-bookings');
var holidaysModel = fq('schemas/holidays');
var mailer = fq('utils/mailer');
var moment = require('moment');
var async = require('async');

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
let view = function (email, callback) {
    bookingsModel.find({
        start: {
            "$gt": new moment()
        },
        bookedBy: email
    }, function (err, bookings) {
        if (err) {
            console.log(err);
            return callback(true, null);
        }
        return callback(false, bookings);
    });
};

// To cancel a booking using object id and email
let cancel = function (id, email, callback) {
    bookingsModel.remove({
        _id: mongoose.Types.ObjectId(id),
        bookedBy: email
    }, function (err) {
        if (err) {
            console.log(err);
            return callback(true);
        }
        return callback(false);
    });
};

//  Gets availible rooms

let getRooms = function (date, timeStart, timeEnd, capacity, bookedForExam, bookedByFaculty, callback) {

    var weekDay = parseInt(weekDayHash[date.substring(0, 3)]);
    var startHour = parseInt(timeStart.substring(0, 2)) - 8;
    var endHour = parseInt(timeEnd.substring(0, 2)) - 8;

    var startTime = new moment(date + " " + timeStart, 'ddd DD MMM YYYY HH:mm').toDate();
    var endTime = new moment(date + " " + timeEnd, 'ddd DD MMM YYYY HH:mm').toDate();

    var lecture = (bookedForExam ? 0 : parseInt(capacity));
    var exam = (bookedForExam ? parseInt(capacity) : 0);

    let holidaySearch = holidaysModel.find({ date: date }, function (err, holidays) {

        if (err) {
            console.log(err);
            return callback(true, null);
        }

        var bookingIsHoliday = holidays.length > 0 ? true : false;
        var now = new moment();
        var todayString = now.format('ddd DD MMM YYYY');
        now = now.toDate();
        var currentHour = now.getHours();
        var sameDayBooking = ((startTime.getDate() == now.getDate()) && (startTime.getMonth() == now.getMonth()) && (startTime.getFullYear() == now.getFullYear())) ? true : false;

        now.setDate(now.getDate() + 1);
        var nextDayBooking = ((startTime.getDate() == now.getDate()) && (startTime.getMonth() == now.getMonth()) && (startTime.getFullYear() == now.getFullYear())) ? true : false;

        holidaysModel.find({ date: todayString }, function (err, ans) {
            if (err) {
                console.log(err);
                return callback(true, null);
            }

            var todayIsHoliday = ans.length > 0 ? true : false;

            if (sameDayBooking && (bookingIsHoliday || weekDay == 6)) {
                return callback(false, {
                    bookingOnHolidaySameDay: 1
                });
            }

            if (sameDayBooking && (weekDay >= 0 && weekDay <= 4) && currentHour >= 16) {
                return callback(false, {
                    bookingAfterFourSameDay: 1
                });
            }

            if (sameDayBooking && weekDay == 5 && currentHour >= 12) {
                return callback(false, {
                    bookingAfterNoonSameDay: 1
                });
            }

            if (weekDay != 6 && bookingIsHoliday && nextDayBooking && (currentHour >= 16 || todayIsHoliday)) {
                return callback(false, {
                    bookingAfterFourNextDay: 1
                });
            }

            if (weekDay == 6 && nextDayBooking && (currentHour >= 12 || todayIsHoliday)) {
                return callback(false, {
                    bookingAfterNoonNextDay: 1
                });
            }

            let blockSearch = bookingsModel.find({
                start: {
                    "$lt": endTime
                },
                end: {
                    "$gt": startTime
                },
                blockAll: true
            }, function (err, results) {
                if (err) {
                    console.log(err);
                    return callback(true, null);
                }
                if (results.length > 0) {
                    return callback(false, { allBlocked: 1 });
                }
                let roomRegularSearch = roomsModel.find({
                    lectureCapacity: {
                        $gt: lecture
                    },
                    examCapacity: {
                        $gt: exam
                    }
                }).lean().exec(function (err, rooms) {

                    if (err) {
                        console.log(err);
                        return callback(true, null);
                    }

                    if (rooms.length == 0) {
                        return callback(false, {
                            high: 1
                        });
                    }

                    if (bookingIsHoliday) {
                        weekDay = 6; // Treat as Sunday
                    }

                    rooms.forEach(function (room, index) {

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

                roomRegularSearch.then(function (rooms) {

                    if (endTime < startTime) {
                        return callback(true);
                    }

                    rooms.forEach(function (room, index) {

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
                            }, function (err, results) {

                                if (err) {
                                    console.log(err);
                                    return callback(true, null);
                                }

                                if (results.length != 0) {
                                    room.availible = false;
                                }

                            });
                        }

                    });
                    return callback(false, rooms);
                });
            });

        });
    });
};

// To make checks and do booking

let makeBooking = function (room, rooms, endTime, startTime, email, av, purpose, phone, bookedByFaculty, callback) {

    rooms.forEach(function (roomL, index) {
        if (roomL.number == room && roomL.availible) {
            bookingsModel.find({
                number: room,
                start: {
                    "$lt": endTime
                },
                end: {
                    "$gt": startTime
                }
            }, function (err, results) {

                if (err) {
                    console.log(err);
                    return callback(true, {});
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

                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                            return callback(true, {});
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
                        return callback(false, result);
                    });
                } else {
                    return callback(false, {
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
