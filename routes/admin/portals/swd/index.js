var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.send("SWD Portal ADMIN");
});

module.exports = router;