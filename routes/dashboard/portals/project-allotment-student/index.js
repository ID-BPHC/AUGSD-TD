var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.send("Project Allotment");
});

module.exports = router;