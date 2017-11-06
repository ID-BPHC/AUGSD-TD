var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.renderState('dashboard/portals/feedbacks-24x7');
});

router.get('/step-1', function(req, res, next){
	res.renderState('dashboard/portals/feedbacks-24x7/gateway');
});

module.exports = router;