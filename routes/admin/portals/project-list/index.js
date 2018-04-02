var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');

var projectsModel = fq('schemas/projects');
var applicationsModel = fq('schemas/project-applications');

router.get('/', function(req, res, next){
	return res.renderState('admin/portals/project-list');
});

module.exports = router;