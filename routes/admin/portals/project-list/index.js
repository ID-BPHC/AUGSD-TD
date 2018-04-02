var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

var projectsModel = fq('schemas/projects');
var applicationsModel = fq('schemas/project-applications');

router.get('/', function (req, res, next) {
	return res.renderState('admin/portals/project-list');
});

router.get('/export/:status', function (req, res, next) {

	var status = req.sanitize(req.params.status);
	console.log(status);
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
			'Student Name': '$studentForeign.name',
			'ID Number': '$studentForeign.idNumber',
			'Instructor': '$instructorForeign.name',
			'Instructor Email': '$instructorForeign.instructor',
			'Project': '$projectForeign.title'
		}
	}], function (err, list) {
		console.log(list);
	});

});

module.exports = router;
