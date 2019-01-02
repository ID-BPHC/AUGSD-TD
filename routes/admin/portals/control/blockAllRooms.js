let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let bookingsModel = fq("schemas/room-bookings");
let Booking = fq("common/BookingClass");
let mongoose = require("mongoose");

let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);

const { check, validationResult } = require("express-validator/check");

router.get("/", function(req, res) {
  bookingsModel.find(
    {
      blockAll: true,
      start: {
        $gte: new moment()
      }
    },
    null,
    { sort: { start: 1 } },
    function(err, docs) {
      if (docs) {
        res.renderState("admin/portals/control/blockAllRooms", {
          bookings: docs
        });
      }
    }
  );
});

router.post(
  "/",
  [
    check("time-start")
      .exists()
      .withMessage("No Start Time Specified")
      .not()
      .isEmpty()
      .withMessage("No Start Time Specified"),
    check("time-end")
      .exists()
      .withMessage("No End Time Specified")
      .not()
      .isEmpty()
      .withMessage("No End Time Specified"),
    check("date")
      .exists()
      .withMessage("No Date Specified")
      .not()
      .isEmpty()
      .withMessage("No Date Specified")
  ],
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", {
        errors: errors.mapped()
      });
    }
    let booking = new Booking(
      req.sanitize(req.user.email),
      req.sanitize(req.body.date),
      req.sanitize(req.body["time-start"]),
      req.sanitize(req.body["time-end"]),
      req.sanitize(req.body.purpose)
    );
    if (booking.endTimeObj <= booking.startTimeObj) {
      return res.renderState("room-booking/errors", {
        message: "End Time was chosen before Start Time"
      });
    }

    let newDoc = new bookingsModel({
      number: ["Block"],
      start: booking.startTimeObj,
      end: booking.endTimeObj,
      bookedBy: booking.email,
      purpose: booking.purpose || "NA",
      blockAll: true
    });
    newDoc.save(function(err) {
      if (err) res.terminate(err);
    });
    res.redirect(req.get("referer"));
  }
);

router.get("/cancel/:id", function(req, res, next) {
  bookingsModel.remove(
    {
      _id: mongoose.Types.ObjectId(req.params.id)
    },
    function(err) {
      if (err) {
        res.terminate(err);
      }
      res.redirect(req.get("referer"));
    }
  );
});
module.exports = router;
