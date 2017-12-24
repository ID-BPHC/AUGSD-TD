var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var bookingsModel = fq('schemas/room-bookings');
var studentsModel = fq('schemas/students');
var moment = require('moment');

router.get('/', function(req, res, next) {
    bookingsModel.find({
            approval: "P",
            start: {
                "$gt": new moment()
            }
        }, null, {
            sort: {
                start: 1
            }
        },
        function(err, bookings) {

            if (err) {
                return res.terminate(err);
            }

            res.renderState('admin/portals/room-booking-approval', {
                bookings: bookings
            });

        });
});

router.get('/view/:id', function(req, res, next) {

    bookingsModel.findOne({

            _id: req.sanitize(req.params.id)

        },
        function(err, booking) {

            if (err) {
                res.terminate(err);
            }

            studentsModel.findOne({
                email: booking.bookedBy
            }, function(err, student) {

                if (err) {
                    res.terminate(err);
                }

                res.renderState('admin/portals/room-booking-approval/view', {
                    booking: booking,
                    student: student
                });
            });

        });

});

router.get('/approve/:id', function(req, res, next) {

    bookingsModel.update({
            _id: req.sanitize(req.params.id)
        }, {
            approval: "A"
        },
        function(err) {

            if (err) {
                return res.terminate(err);
            }

            res.redirect('/admin/room-booking-approval');
        });

});

router.get('/reject/:id', function(req, res, next) {

    bookingsModel.update({
            _id: req.sanitize(req.params.id)
        }, {
            approval: "R"
        },
        function(err) {

            if (err) {
                return res.terminate(err);
            }

            res.redirect('/admin/room-booking-approval');
        });

});

module.exports = router;