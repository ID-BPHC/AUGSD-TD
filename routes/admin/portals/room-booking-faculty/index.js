let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomBookingFaculty = fq("common/room-booking");
let nocache = require("nocache");
let Booking = fq("common/BookingClass");
let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);

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

    let booking = new Booking(
      req.sanitize(req.user.email),
      req.sanitize(req.body.date),
      req.sanitize(req.body["time-start"]),
      req.sanitize(req.body["time-end"]),
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

router.post("/submit", function(req, res, next) {
  roomBookingFaculty.makeBooking(req.session.booking, req.body.rooms, function(
    err,
    result
  ) {
    if (err) {
      return res.terminate("Error");
    }
    return res.json(result);
  });
});

module.exports = router;
