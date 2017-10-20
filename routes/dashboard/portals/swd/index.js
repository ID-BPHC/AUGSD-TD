var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	console.log(req.user);
	res.send("SWD Portal STUDENT");
});

module.exports = router;