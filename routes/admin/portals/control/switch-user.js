var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

var adminsModel = fq('schemas/admins');

router.get('/', function (req, res, next) {

	adminsModel.find({}, {}, { sort: { "email": 1 } }, function (err, users) {

		if (err) {
			console.log(err);
			return res.terminate("Could not find admins");
		}

		return res.renderState('admin/portals/control/switch-user', {
			users: users
		});

	});

});

module.exports = router;
