let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomBookingFaculty = fq("common/room-booking");
let moment = require("moment");
let nocache = require("nocache");
let Booking = fq("common/BookingClass");

const { check, validationResult } = require("express-validator/check");

// GET Requests

router.use(nocache());

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
  "/step-2/:timestamp",
  [
    check("capacity")
      .exists()
      .withMessage("No Capacity")
      .isNumeric()
      .withMessage("Invalid Capacity")
      .not()
      .isEmpty()
      .withMessage("No Capacity"),
    check("purpose")
      .exists()
      .withMessage("No Purpose")
      .not()
      .isEmpty()
      .withMessage("No Purpose"),
    check("date")
      .exists()
      .withMessage("No Date")
      .not()
      .isEmpty()
      .withMessage("No Date Specified"),
    check("phone")
      .exists()
      .withMessage("No Phone")
      .isNumeric()
      .withMessage("Invalid Phone")
      .isLength({ min: 10, max: 10 })
      .withMessage("Invalid Phone")
      .not()
      .isEmpty()
      .withMessage("No Phone"),
    check("av")
      .exists()
      .withMessage("No AV Value")
      .isIn(["Yes", "No"])
      .withMessage("Invalid AV Value"),
    check("le")
      .exists()
      .isIn(["Yes", "No"])
      .withMessage("Lecture/Exam not specified")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }

    let booking = new Booking(
      req.sanitize(req.body.date),
      req.sanitize(req.body["time-start"]),
      req.sanitize(req.body["time-end"]),
      (req.session.purpose = req.sanitize(req.body.purpose)),
      (req.session.av = req.sanitize(req.body.av) == "Yes" ? true : false),
      req.sanitize(req.body.phone),
      true
    );

    if (booking.endTimeObj <= booking.startTimeObj) {
      return res.renderState("custom_errors", {
        redirect: "/admin/room-booking-faculty/step-1",
        timeout: 5,
        supertitle: "Time Error",
        message: "End Time was chosen before Start Time"
      });
    }

    roomBookingFaculty.getRooms(booking, function(err, rooms) {
      if (err) {
        return res.terminate("Error");
      }

      if (rooms.allBlocked == 1) {
        return res.renderState("custom_errors", {
          message: "Rooms Blocked",
          details: "All the rooms for the given time are blocked",
          redirect: "/admin/room-booking-faculty/step-1",
          timeout: 5
        });
      }

      if (rooms.noWorkingHours == 1) {
        return res.renderState("custom_errors", {
          message: "No Working Hours",
          details:
            "There are no working office hours to process your application",
          redirect: "/admin/room-booking-faculty/step-1",
          timeout: 5
        });
      }

      // req.session.rooms = rooms;
      // req.session.startTime = startTime;
      // req.session.endTime = endTime;
      // req.session.av = req.sanitize(req.body.av) == "Yes" ? true : false;
      // req.session.purpose = req.sanitize(req.body.purpose);
      // req.session.phone = req.sanitize(req.body.phone);
      // req.session.save();

      res.renderState("room-booking/step2", {
        rooms: rooms
      });
    });
  }
);

router.post("/step-3", function(req, res, next) {
  let room = req.sanitize(req.body.room);

  roomBookingFaculty.makeBooking(
    room,
    req.session.rooms,
    req.session.endTime,
    req.session.startTime,
    req.user.email,
    req.session.av,
    req.session.purpose,
    req.session.phone,
    true,
    function(err, result) {
      if (err) {
        return res.terminate("Error");
      }

      if (result.alreadyBooked == 1) {
        return res.renderState("custom_errors", {
          message: "Oops.. Room already booked.",
          details:
            "Someone else booked this room while you were booking. Please book some other room.",
          redirect: "/admin/room-booking-faculty/step-1",
          timeout: 5
        });
      }

      res.renderState("room-booking/step3", {
        number: room,
        start: result.start.toString(),
        end: result.end.toString(),
        phone: req.session.phone,
        av: req.session.av
      });
    }
  );
});

module.exports = router;
