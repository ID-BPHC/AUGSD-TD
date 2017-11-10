var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.renderState('dashboard/portals/feedbacks-24x7');
});

router.get('/step-1', function (req, res, next) {
	res.renderState('dashboard/portals/feedbacks-24x7/step1');
});

router.post('/step-2', function (req, res, next) {
	console.log(req.body);
	res.renderState('dashboard/portals/feedbacks-24x7/step2', {params: req.params});
});
module.exports = router;