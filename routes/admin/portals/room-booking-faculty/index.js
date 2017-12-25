var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

router.get('/', function(req, res, next) {
    res.send('Faculty Room Booking');
});

module.exports = router;