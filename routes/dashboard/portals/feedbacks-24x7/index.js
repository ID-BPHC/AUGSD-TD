var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.renderState('dashboard/portals/feedbacks-24x7');
});

module.exports = router;