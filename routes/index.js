var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var users = fq('users');

router.get('/', function (req, res, next) {
    res.render('index');
});
router.get('/team', function (req, res, next) {
    res.render('team', {
        users: users,
        column: 3,
        totalModules: 17
    });
});
router.get('/type', function (req, res, next) {
    res.render('type');
});

module.exports = router;