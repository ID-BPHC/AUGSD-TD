var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
 	res.render('custom_errors', {message: "Instruction Division"});
});

module.exports = router;
