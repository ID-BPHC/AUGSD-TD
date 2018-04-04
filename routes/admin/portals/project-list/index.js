var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;

var projectsModel = fq('schemas/projects');
var applicationsModel = fq('schemas/project-applications');

router.get('/', function (req, res, next) {
	return res.renderState('admin/portals/project-list');
});

router.get('/export/:status', function (req, res, next) {

	var status = req.sanitize(req.params.status);

	applicationsModel.aggregate([{
		$match: {
			status: status
		}
	}, {
		$lookup: {
			from: 'projects',
			localField: 'project',
			foreignField: '_id',
			as: 'projectForeign'
		}
	}, {
		$lookup: {
			from: 'students',
			localField: 'student',
			foreignField: 'email',
			as: 'studentForeign'
		}
	}, {
		$lookup: {
			from: 'projectheads',
			localField: 'projectForeign.instructor',
			foreignField: 'instructor',
			as: 'instructorForeign'
		}
	}, {
		$project: {
			'Student_Name': '$studentForeign.name',
			'ID_Number': '$studentForeign.idNumber',
			'Instructor': '$instructorForeign.name',
			'Instructor_Email': '$instructorForeign.instructor',
			'Project': '$projectForeign.title',
			_id: 0
		}
	}, {
		$unwind: '$Student_Name'
	}, {
		$unwind: '$ID_Number'
	}, {
		$unwind: '$Instructor'
	}, {
		$unwind: '$Instructor_Email'
	}, {
		$unwind: '$Project'
	}], function (err, list) {

		const json2csvParser = new Json2csvParser();
		const csv = json2csvParser.parse(list);

		console.log(csv);

	});
});

module.exports = router;
