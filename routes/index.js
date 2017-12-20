var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});
router.get('/team', function(req, res, next) {
    res.render('team');
});
router.get('/type', function(req, res, next) {
    res.render('type');
});

module.exports = router;