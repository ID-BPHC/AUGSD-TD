var express = require('express');
var router = express.Router();

router.get('/', (req,res,next)=>{
	res.renderState("dashboard/portals/project-update");
});

router.get('/:id', (req,res,next)=>{
	res.renderState("dashboard/portals/project-update/update");
});

module.exports = router;
