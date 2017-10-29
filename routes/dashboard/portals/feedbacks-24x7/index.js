var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.send("Feedbacks 24x7");
});

module.exports = router;