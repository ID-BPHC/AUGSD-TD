var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send("ESD Portal ADMIN");
});

module.exports = router;