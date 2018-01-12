var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

router.get('/', function(req, res, next){
	res.renderState('dashboard/portals/inductions');
});

module.exports = router;
