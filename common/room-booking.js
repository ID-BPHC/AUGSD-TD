let fq = require("fuzzquire");
let mongoose = require("mongoose");
let roomsModel = fq("schemas/rooms");
let bookingsModel = fq("schemas/room-bookings");
let holidaysModel = fq("schemas/holidays");
let ttExceptionsModel = fq("schemas/ttExceptions");
let mailer = fq("utils/mailer");
let async = require("async");
let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);

let weekDayHash = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6
};

let isHoliday = function(date, cb) {
  if (date.day() === 0) return cb(true);
  holidaysModel.find({ date: date.format("ddd DD MMM YYYY") }, function(
    err,
    results
  ) {
    if (err) throw err;
    if (results.length > 0) cb(true);
    else cb(false);
  });
};

let getWeekDay = function(date, cb) {
  ttExceptionsModel.findOne({ date: date }, function(err, result) {
    if (err) throw err;
    if (result !== null) cb(result.exception);
    else cb(parseInt(weekDayHash[date.substring(0, 3)]));
  });
};

let getWorkingHours = function(date, cb) {
  let range = moment.range(new moment(), date).by("hours");
  async.filter(
    range,
    function(currentHour, checkNext) {
      isHoliday(currentHour, function(holiday) {
        if (holiday) checkNext(null, false);
        else if (
          currentHour.day() === 6 &&
          (currentHour.hour() <= 8 || currentHour.hour() >= 12)
        )
          checkNext(null, false);
        else if (currentHour.hour() <= 8 || currentHour.hour() >= 16)
          checkNext(null, false);
        else checkNext(null, true);
      });
    },
    function(err, workingHours) {
      if (err) throw err;
      cb(workingHours);
    }
  );
};

let checkIfAllBlocked = function(startTime, endTime, cb) {
  bookingsModel.find(
    {
      start: {
        $lt: endTime
      },
      end: {
        $gt: startTime
      },
      blockAll: true
    },
    function(err, results) {
      if (err) {
        console.log(err);
        throw err;
      }
      if (results.length > 0) {
        return cb(true);
      } else {
        return cb(false);
      }
    }
  );
};

let checkAvailability = function(room, booking, cb) {
  if (booking.startHour <= 9) {
    for (i = booking.startHour; i <= booking.endHour; i++) {
      if (
        i >= 0 &&
        typeof room.fixedClasses[booking.weekDay][i] !== "undefined" &&
        room.fixedClasses[booking.weekDay][i] !== ""
      ) {
        return cb(false);
      }
    }
  }

  bookingsModel.find(
    {
      number: room.number,
      start: {
        $lt: booking.endTimeObj
      },
      end: {
        $gt: booking.startTimeObj
      },
      approval: {
        $ne: "R"
      }
    },
    function(err, results) {
      if (err) {
        console.log(err);
        throw err;
      }
      if (results.length != 0) {
        return cb(false);
      } else {
        return cb(true);
      }
    }
  );
};

let getRoomList = function(booking, cb) {
  roomsModel
    .find({})
    .lean()
    .exec(function(err, rooms) {
      if (err) {
        console.log(err);
        throw err;
      }
      async.filter(
        rooms,
        function(room, filterCallback) {
          checkAvailability(room, booking, function(available) {
            filterCallback(null, available);
          });
        },
        function(err, filteredRooms) {
          cb(filteredRooms);
        }
      );
    });
};

// Returns all the future bookings made by a user
let view = function(email, callback) {
  bookingsModel.find(
    {
      start: {
        $gte: new moment()
      },
      bookedBy: email
    },
    null,
    { sort: { start: 1 } },
    function(err, bookings) {
      if (err) {
        console.log(err);
        return callback(true, null);
      }
      return callback(false, bookings);
    }
  );
};

// To cancel a booking using object id and email
let cancel = function(id, email, callback) {
  bookingsModel.remove(
    {
      _id: mongoose.Types.ObjectId(id),
      bookedBy: email
    },
    function(err) {
      if (err) {
        console.log(err);
        return callback(true);
      }
      return callback(false);
    }
  );
};

//  Gets available rooms

let getRooms = function(booking, callback) {
  getWeekDay(booking.dateString, function(weekDay) {
    getWorkingHours(booking.startTimeObj, function(workingHours) {
      if (workingHours.length === 0)
        return callback(false, { noWorkingHours: 1 });

      checkIfAllBlocked(booking.startTimeObj, booking.endTimeObj, function(
        allBlocked
      ) {
        if (allBlocked) return callback(false, { allBlocked: 1 });

        isHoliday(booking.startTimeObj, function(holiday) {
          if (holiday) weekDay = 6;
          booking.holiday = holiday;
          booking.weekDay = weekDay;
          getRoomList(booking, function(rooms) {
            callback(false, rooms);
          });
        });
      });
    });
  });
};

// To make checks and do booking

let makeBooking = function(booking, rooms, callback) {
  getWorkingHours(booking.startTimeObj, function(workingHours) {
    if (workingHours.length === 0)
      return callback(false, { noWorkingHours: 1 });

    checkIfAllBlocked(booking.startTimeObj, booking.endTimeObj, function(
      allBlocked
    ) {
      if (allBlocked) return callback(false, { allBlocked: 1 });

      async.filter(
        rooms,
        function(room, next) {
          roomsModel.findOne({ number: room }, function(err, roomDB) {
            if (err) {
              console.log(err);
              throw err;
            }
            checkAvailability(roomDB, booking, function(available) {
              next(null, available);
            });
          });
        },
        function(err, filteredRooms) {
          if (filteredRooms.length == rooms.length) {
            bookingsModel.create(
              {
                number: rooms,
                start: booking.startTimeObj,
                end: booking.endTimeObj,
                bookedBy: booking.email,
                av: booking.av,
                purpose: booking.purpose,
                phone: booking.phone,
                approval: booking.isFaculty ? "A" : "P"
              },
              function(err, result) {
                if (err) {
                  console.log(err);
                  throw err;
                }
                if (booking.isFaculty) {
                  mailer.send({
                    email: booking.email,
                    subject: "Room Booking",
                    body:
                      "Your request for room booking has been confirmed.<br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" +
                      filteredRooms.toString() +
                      "</td></tr><tr><td><b>From</b></td><td>" +
                      result.start.toString() +
                      "</td></tr><tr><td><b>To</b></td><td>" +
                      result.end.toString() +
                      "</td></tr></table>"
                  });
                } else {
                  mailer.send({
                    email: booking.email,
                    subject: "Room Booking",
                    body:
                      "Your request for room booking has been initiated. Please wait for approval. <br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" +
                      filteredRooms.toString() +
                      "</td></tr><tr><td><b>From</b></td><td>" +
                      result.start.toString() +
                      "</td></tr><tr><td><b>To</b></td><td>" +
                      result.end.toString() +
                      "</td></tr></table>"
                  });
                }
                return callback(null, { booked: 1 });
              }
            );
          } else {
            async.filter(
              rooms,
              function(room, checkNext) {
                if (filteredRooms.indexOf(room) === -1) checkNext(null, true);
                else checkNext(null, false);
              },
              function(err, notAvailable) {
                return callback(false, { partialBooking: 1, notAvailable });
              }
            );
          }
        }
      );
    });
  });
};

module.exports = {
  view: view,
  cancel: cancel,
  getRooms: getRooms,
  makeBooking: makeBooking
};
