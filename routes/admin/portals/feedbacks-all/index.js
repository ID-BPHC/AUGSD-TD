var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var feedbacksModel = fq('schemas/feedbacks');

router.get('/24x7', function (req, res, next) {
	feedbacksModel.find({}, null, { sort: { createdOn: -1 } }, function (err, feedbacks) {
		if (err) {
			return res.terminate(err);
		}
		return res.json(feedbacks);
	});
});

router.get('/', function (req, res, next) {
	res.redirect('/admin/feedbacks-all/24x7');
});

module.exports = router;
