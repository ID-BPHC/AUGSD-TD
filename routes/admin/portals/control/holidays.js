var express = require('express');
var path = require('path');
var router = express.Router();
var fq = require('fuzzquire');
var holidaysModel = fq('schemas/holidays');

router.get('/', function (req, res, next) {

	holidaysModel.find({}, function (err, holidays) {
		if (err) {
			return res.terminate(err);
		}
		res.renderState('admin/portals/control/holidays', { holidays: holidays });
	});

});

module.exports = router;
