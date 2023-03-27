let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomBookingFaculty = fq("common/room-booking");
let nocache = require("nocache");
let Booking = fq("common/BookingClass");
let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);
let holidaysModel = fq("schemas/holidays");

const { check, validationResult } = require("express-validator/check");

// GET Requests

router.get("/", function(req, res, next) {
  res.renderState("room-booking");
});

router.get("/book", function(req, res, next) {
  res.renderState("room-booking/book");
});

router.get("/view", function(req, res, next) {
  roomBookingFaculty.view(req.sanitize(req.user.email), function(
    err,
    bookings
  ) {
    if (err) {
      return res.terminate("Error");
    }
    res.renderState("room-booking/view", {
      bookings: bookings
    });
  });
});

router.get("/cancel/:id", function(req, res, next) {
  roomBookingFaculty.cancel(
    req.sanitize(req.params.id),
    req.sanitize(req.user.email),
    function(err) {
      if (err) {
        return res.terminate("Error");
      }
      res.redirect("/admin/room-booking-faculty/view");
    }
  );
});

// POST Requests

router.post(
  "/fetch-list/:timestamp",
  [
    check("purpose")
      .exists()
      .withMessage("No Purpose Specified")
      .not()
      .isEmpty()
      .withMessage("No Purpose Specified"),
    check("time-start")
      .exists()
      .withMessage("No Start Time Specified")
      .not()
      .isEmpty()
      .withMessage("No Start Time Specified")
      .custom((value) => {
        const startTime = moment(value, "HH:mm");
        if (startTime.isSameOrBefore(moment("06:00", "HH:mm")) && startTime.isSameOrAfter(moment("00:00", "HH:mm"))) {
          return false;
        }
        return true;
      })
      .withMessage("Start time must not be between 12:00 AM and 6:00 AM"),
    check("time-end")
      .exists()
      .withMessage("No End Time Specified")
      .not()
      .isEmpty()
      .withMessage("No End Time Specified")
      .custom((value) => {
        const endTime = moment(value, "HH:mm");
        if (endTime.isSameOrBefore(moment("06:00", "HH:mm")) && endTime.isSameOrAfter(moment("00:00", "HH:mm"))) {
          return false;
        }
        return true;
      })
      .withMessage("End time must not be between 12:00 AM and 6:00 AM"),
    check("date")
      .exists()
      .withMessage("No Date Specified")
      .not()
      .isEmpty()
      .withMessage("No Date Specified"),
    check("phone")
      .exists()
      .withMessage("No Phone Number Specified")
      .isNumeric()
      .withMessage("Invalid Phone Number Specified")
      .isLength({ min: 10, max: 10 })
      .withMessage("Invalid Phone Number Specified")
      .not()
      .isEmpty()
      .withMessage("No Phone Number Specified"),
    check("av")
      .exists()
      .withMessage("No Audio-Visual Value Specified")
      .isIn(["Yes", "No"])
      .withMessage("Invalid Audio-Visual Value Specified")
  ],
  nocache(),
  function(req, res, next) {
    res.status(400);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("room-booking/form-errors", {
        errors: errors.mapped()
      });
    }

    if (req.body.dates.length == 0) {
      return res.renderState("room-booking/errors", {
        message: "End Date was chosen before Start Date"
      });
    }

    let booking = new Booking(
      req.sanitize(req.user.email),
      req.sanitize(req.body.date),
      req.sanitize(req.body["time-start"]),
      req.sanitize(req.body["time-end"]),
      req.body.dates,
      (req.session.purpose = req.sanitize(req.body.purpose)),
      (req.session.av = req.sanitize(req.body.av) == "Yes" ? true : false),
      req.sanitize(req.body.phone),
      true
    );

    if (booking.endTimeObj <= booking.startTimeObj) {
      return res.renderState("room-booking/errors", {
        message: "End Time was chosen before Start Time"
      });
    }

    roomBookingFaculty.getRooms(booking, function(err, rooms) {
      if (err) {
        return res.terminate("Error");
      }

      if (rooms.allBlocked == 1) {
        return res.renderState("room-booking/errors", {
          message:
            "All the rooms for the selected date-time have been blocked by the administrator. Please contact Timetable Office for further assistance"
        });
      }

      if (rooms.noWorkingHours == 1) {
        return res.renderState("room-booking/errors", {
          message:
            "There are no working office hours to process your application."
        });
      }

      req.session.booking = booking;
      req.session.save();
      res.status(200);

      res.renderState("room-booking/room-list", {
        rooms,
        date: booking.dateString,
        start: booking.startString,
        end: booking.endString
      });
    });
  }
);

router.post("/submit", async function (req, res, next) {
  const dates = req.session.booking.dates;
  let results = [];

  let weekDayHash = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6
  };

  let handleResult = (value, result) => {
    results.push(result);
    if (results.length === dates.length) {
      let bookedFlag = false;
      for (const result of results) {
        if (result.partialBooking || result.noWorkingHours || result.allBlocked) {
          bookedFlag = true;
          return res.json(result);
        }
      }
      if (!bookedFlag) {
        return res.json({ booked: 1 });
      }
    }
  };

  let isHoliday = async function (date) {
    if (date.day() === 0) return true;
    let results = await holidaysModel.find({ date: date.format("ddd DD MMM YYYY") });
    if (results.length > 0) return true;
    else return false;
  };

  for (const date of dates) {
    let booking = Object.assign({}, req.session.booking);
    booking.weekDay = (parseInt(weekDayHash[date.substring(0, 3)]));
    booking.dateString = date;
    booking.startTimeObj = moment(booking.dateString + " " + booking.startString, 'ddd DD MMM YYYY HH:mm').toISOString();
    booking.endTimeObj = moment(booking.dateString + " " + booking.endString, 'ddd DD MMM YYYY HH:mm').toISOString();
    booking.holiday = await isHoliday(new moment(booking.startTimeObj));
    roomBookingFaculty.makeBooking(booking, req.body.rooms, handleResult);
  }
});

module.exports = router;
