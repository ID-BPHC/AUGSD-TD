let fq = require("fuzzquire");
let mongoose = require("mongoose");
let roomsModel = fq("schemas/rooms");
let bookingsModel = fq("schemas/room-bookings");
let holidaysModel = fq("schemas/holidays");
let ttExceptionsModel = fq("schemas/ttExceptions");
let adminsModel = fq("schemas/admins");
let mailer = fq("utils/mailer");
let async = require("async");
let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);

// Helper function to check if user is a superUser
let isSuperUser = function(email, callback) {
  adminsModel.findOne({ email: email }, function(err, admin) {
    if (err) {
      console.log(err);
      return callback(false);
    }
    return callback(admin && admin.superUser === true);
  });
};

// Helper function to check if user is faculty (admin)
let isFaculty = function(email, callback) {
  adminsModel.findOne({ email: email }, function(err, admin) {
    if (err) {
      console.log(err);
      return callback(false);
    }
    return callback(admin ? true : false); // Any admin is considered faculty
  });
};

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

// Check if user has exceeded daily booking limit (2 hours per day)
let checkDailyBookingLimit = function(email, bookingDate, newBookingDuration, cb) {
  // Skip all limits for superUsers
  isSuperUser(email, function(isSuper) {
    if (isSuper) {
      return cb(false, 0); // No limit for superUsers
    }
    
    // Skip all limits for faculty
    isFaculty(email, function(isFac) {
      if (isFac) {
        return cb(false, 0); // No limit for faculty
      }
      
      const startOfDay = moment(bookingDate).startOf('day');
      const endOfDay = moment(bookingDate).endOf('day');
      
      bookingsModel.find({
        bookedBy: email,
        start: {
          $gte: startOfDay.toDate(),
          $lt: endOfDay.toDate()
        },
        approval: {
          $ne: "R" // Exclude rejected bookings
        }
      }, function(err, existingBookings) {
        if (err) {
          console.log(err);
          throw err;
        }
        
        let totalDuration = 0;
        existingBookings.forEach(function(booking) {
          const duration = moment.duration(moment(booking.end).diff(moment(booking.start)));
          totalDuration += duration.asHours();
        });
        
        // Check if adding new booking would exceed 2-hour daily limit
        if (totalDuration + newBookingDuration > 2) {
          return cb(true, totalDuration); // Limit exceeded
        } else {
          return cb(false, totalDuration); // Within limit
        }
      });
    });
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
          (currentHour.hour() <= 8 || currentHour.hour() > 11 || (currentHour.hour() === 11 && currentHour.minute() >= 30))
        )
          checkNext(null, false);
        else if (currentHour.hour() <= 8 || currentHour.hour() > 16 || (currentHour.hour() === 16 && currentHour.minute() >= 30))
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
  // Updated to reflect new working hours: weekdays until 4:30 PM (startHour 8), Saturday until 11:30 AM (startHour 3)
  let maxWorkingHour = booking.weekDay === 6 ? 3 : 8; // Saturday: 11:30 AM, Weekdays: 4:30 PM
  if (!booking.holiday && booking.startHour <= maxWorkingHour) {
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
  // Function to proceed with room availability checking
  let proceedWithRoomCheck = function() {
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

  // Skip all duration and daily limits for superUsers and faculty
  isSuperUser(booking.email, function(isSuper) {
    if (isSuper) {
      // Skip all checks for superUsers, directly proceed to room availability
      proceedWithRoomCheck();
      return;
    }

    // Check if user is faculty
    isFaculty(booking.email, function(isFac) {
      if (isFac) {
        // Skip duration limits for faculty, directly proceed to room availability
        proceedWithRoomCheck();
        return;
      }
      
      // Check if booking duration exceeds 2 hours for students only
      const duration = moment.duration(moment(booking.endTimeObj).diff(moment(booking.startTimeObj)));
      const hours = duration.asHours();
      if (hours > 2) {
        return callback(false, { 
          durationExceeded: 1,
          message: "Booking duration cannot exceed 2 hours"
        });
      }

      // Check daily booking limit (2 hours per day per email) for students only
      checkDailyBookingLimit(booking.email, booking.startTimeObj, hours, function(limitExceeded, currentDuration) {
        if (limitExceeded) {
          return callback(false, {
            dailyLimitExceeded: 1,
            message: `Daily booking limit exceeded. You have already booked ${currentDuration.toFixed(1)} hours today. Maximum allowed is 2 hours per day.`
          });
        }

        // Proceed with room checking for students
        proceedWithRoomCheck();
      });
    });
  });
};

// To make checks and do booking

let makeBooking = function(booking, rooms, callback) {
  // Function to proceed with booking process
  let proceedWithBooking = function() {
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

  // Skip all duration and daily limits for superUsers and faculty
  isSuperUser(booking.email, function(isSuper) {
    if (isSuper) {
      // Skip all checks for superUsers, directly proceed to booking
      proceedWithBooking();
      return;
    }

    // Check if user is faculty
    isFaculty(booking.email, function(isFac) {
      if (isFac) {
        // Skip duration limits for faculty, directly proceed to booking
        proceedWithBooking();
        return;
      }
      
      // Check if booking duration exceeds 2 hours for students only
      const duration = moment.duration(moment(booking.endTimeObj).diff(moment(booking.startTimeObj)));
      const hours = duration.asHours();
      if (hours > 2) {
        return callback(false, { 
          durationExceeded: 1,
          message: "Booking duration cannot exceed 2 hours"
        });
      }

      // Check daily booking limit (2 hours per day per email) for students only
      checkDailyBookingLimit(booking.email, booking.startTimeObj, hours, function(limitExceeded, currentDuration) {
        if (limitExceeded) {
          return callback(false, {
            dailyLimitExceeded: 1,
            message: `Daily booking limit exceeded. You have already booked ${currentDuration.toFixed(1)} hours today. Maximum allowed is 2 hours per day.`
          });
        }

        // Proceed with booking for students
        proceedWithBooking();
      });
    });
  });
};

// Get daily booking usage for a user
let getDailyBookingUsage = function(email, date, callback) {
  const startOfDay = moment(date).startOf('day');
  const endOfDay = moment(date).endOf('day');
  
  bookingsModel.find({
    bookedBy: email,
    start: {
      $gte: startOfDay.toDate(),
      $lt: endOfDay.toDate()
    },
    approval: {
      $ne: "R" // Exclude rejected bookings
    }
  }, function(err, existingBookings) {
    if (err) {
      console.log(err);
      throw err;
    }
    
    let totalDuration = 0;
    existingBookings.forEach(function(booking) {
      const duration = moment.duration(moment(booking.end).diff(moment(booking.start)));
      totalDuration += duration.asHours();
    });
    
    callback(null, {
      totalHours: totalDuration,
      remainingHours: Math.max(0, 2 - totalDuration),
      bookings: existingBookings
    });
  });
};

module.exports = {
  view: view,
  cancel: cancel,
  getRooms: getRooms,
  makeBooking: makeBooking,
  getDailyBookingUsage: getDailyBookingUsage
};
