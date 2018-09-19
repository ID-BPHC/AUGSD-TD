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
    function(err, workingDays) {
      if (err) throw err;
      cb(workingDays);
    }
  );
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

let getRooms = function(
  date,
  timeStart,
  timeEnd,
  capacity,
  bookedForExam,
  bookedByFaculty,
  callback
) {
  getWeekDay(date, function(weekDay) {
    let startHour = parseInt(timeStart.substring(0, 2)) - 8;
    let endHour = parseInt(timeEnd.substring(0, 2)) - 8;
    let startTime;
    let endTime;
    try {
      startTime = new moment(
        date + " " + timeStart,
        "ddd DD MMM YYYY HH:mm"
      ).utcOffset("+05:30");
      endTime = new moment(
        date + " " + timeEnd,
        "ddd DD MMM YYYY HH:mm"
      ).utcOffset("+05:30");
    } catch (e) {
      throw e;
    }

    let lecture = bookedForExam ? 0 : parseInt(capacity);
    let exam = bookedForExam ? parseInt(capacity) : 0;

    getWorkingHours(startTime, function(workingHours) {
      if (workingHours.length === 0)
        return callback(false, { noWorkingHours: 1 });
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
            return callback(true, null);
          }
          if (results.length > 0) {
            return callback(false, { allBlocked: 1 });
          }
          let roomRegularSearch = roomsModel
            .find({
              lectureCapacity: {
                $gte: lecture
              },
              examCapacity: {
                $gte: exam
              }
            })
            .lean()
            .exec(function(err, rooms) {
              if (err) {
                console.log(err);
                return callback(true, null);
              }

              if (rooms.length == 0) {
                return callback(false, {
                  high: 1
                });
              }

              isHoliday(startTime, function(holiday) {
                if (holiday) weekDay = 6;
                async.each(
                  rooms,
                  function(room, checkNext) {
                    room.available = true;
                    if (startHour >= 0 && startHour <= 9) {
                      for (i = startHour; i <= endHour; i++) {
                        if (
                          typeof room.fixedClasses[weekDay][i] !==
                            "undefined" &&
                          room.fixedClasses[weekDay][i] !== ""
                        ) {
                          room.available = false;
                          break;
                        }
                      }
                    }
                    checkNext();
                  },
                  function() {
                    return checkExisting(rooms);
                  }
                );
              });
            });
          let checkExisting = function(rooms) {
            if (endTime <= startTime) {
              return callback(true);
            }

            async.each(
              rooms,
              function(room, checkNext) {
                if (room.available) {
                  bookingsModel.find(
                    {
                      number: room.number,
                      start: {
                        $lt: endTime
                      },
                      end: {
                        $gt: startTime
                      },
                      approval: {
                        $ne: "R"
                      }
                    },
                    function(err, results) {
                      if (err) {
                        console.log(err);
                        return callback(true, null);
                      }

                      if (results.length != 0) {
                        room.available = false;
                      }
                    }
                  );
                }
                checkNext();
              },
              function() {
                return callback(false, rooms);
              }
            );
          };
        }
      );
    });
  });
};

// To make checks and do booking

let makeBooking = function(
  room,
  rooms,
  endTime,
  startTime,
  email,
  av,
  purpose,
  phone,
  bookedByFaculty,
  callback
) {
  rooms.forEach(function(roomL, index) {
    if (roomL.number == room && roomL.available) {
      bookingsModel.find(
        {
          number: room,
          start: {
            $lt: endTime
          },
          end: {
            $gt: startTime
          },
          approval: {
            $ne: "R"
          }
        },
        function(err, results) {
          if (err) {
            console.log(err);
            return callback(true, {});
          }

          if (results.length == 0) {
            bookingsModel.create(
              {
                number: room,
                start: startTime,
                end: endTime,
                bookedBy: email,
                av: av,
                purpose: purpose,
                phone: phone,
                approval: bookedByFaculty ? "A" : "P"
              },
              function(err, result) {
                if (err) {
                  console.log(err);
                  return callback(true, {});
                }
                if (!bookedByFaculty) {
                  mailer.send({
                    email: email,
                    subject: "Room Booking",
                    body:
                      "Your request for room booking has been initiated. Please wait for approval. <br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" +
                      room +
                      "</td></tr><tr><td><b>From</b></td><td>" +
                      result.start.toString() +
                      "</td></tr><tr><td><b>To</b></td><td>" +
                      result.end.toString() +
                      "</td></tr></table>"
                  });
                } else {
                  mailer.send({
                    email: email,
                    subject: "Room Booking",
                    body:
                      "Your request for room booking has been confirmed.<br><br><table><tr><td><b>Room No. :</b>&nbsp;</td><td>" +
                      room +
                      "</td></tr><tr><td><b>From</b></td><td>" +
                      result.start.toString() +
                      "</td></tr><tr><td><b>To</b></td><td>" +
                      result.end.toString() +
                      "</td></tr></table>"
                  });
                }
                return callback(false, result);
              }
            );
          } else {
            return callback(false, {
              alreadyBooked: 1
            });
          }
        }
      );
    }
  });
};

module.exports = {
  view: view,
  cancel: cancel,
  getRooms: getRooms,
  makeBooking: makeBooking
};
