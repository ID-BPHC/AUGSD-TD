var express = require('express');
var router = express.Router();

var fq = require('fuzzquire');
var Promise = require('promise');

var projectsModel = fq('schemas/projects');
var headsModel = fq('schemas/project-heads');

router.get('/', function (req, res, next) {

	projectsModel.aggregate(
		[{
			$lookup: {
				from: "projectheads",
				localField: "instructor",
				foreignField: "instructor",
				as: "instructorForeign"
			}
		}, {
			$project: {
				"department": "$instructorForeign.department",
				"instructorName": "$instructorForeign.name",
				title: 1,
				description: 1,
				instrutor: 1,
				name: 1,
				updated: 1,
				type: 1
			}
		}, {
			$unwind: "$department"
		}, {
			$unwind: "$instructorName"
		}],
		function (err, result) {
			if (err) {
				console.log(err);
				return res.terminate("Aggregate Error");
			}
			return res.json(result);
		});

});

module.exports = router;
