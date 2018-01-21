var express = require('express');
var path = require('path');
var router = express.Router();
var fq = require('fuzzquire');

router.get('/', function (req, res, next) {
    res.renderState('admin/portals/control/holiday');
});

module.exports = router;