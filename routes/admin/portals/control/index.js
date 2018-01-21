var express = require('express');
var path = require('path');
var router = express.Router();
var fq = require('fuzzquire');

var holiday = require('./holidays.js');

router.use('/holidays', holiday);

router.get('/', function (req, res, next) {
    res.renderState('admin/portals/control');
});

module.exports = router;