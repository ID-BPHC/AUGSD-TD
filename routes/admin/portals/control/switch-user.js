var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

var adminsModel = fq('schemas/admins');

router.get('/', function (req, res, next) {

	adminsModel.find({}, function(err, admins){

		if(err) {
			console.log(err);
			return res.terminate("Could not find admins");
		}

		return res.renderState('admin/portals/control/switch-user', {
			admins: admins
		});

	});	

});

module.exports = router;
