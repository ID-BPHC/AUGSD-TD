var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var bookingsModel = fq('schemas/room-bookings');
var moment = require('moment');

router.get('/', function (req, res, next) {
	bookingsModel.find({ end: { $gt: new moment() }, approval: "A" }, null, { sort: { start: 1 } }, function (err, bookings) {
		if (err) {
			return res.terminate(err);
		}
		return res.renderState('admin/portals/room-booking-esd', { bookings: bookings });
	});
});

module.exports = router;
