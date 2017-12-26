var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.renderState('dashboard/portals/ta');
});

module.exports = router;