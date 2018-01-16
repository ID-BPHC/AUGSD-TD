var express = require('express');
var router = express.Router();

var finalString;

router.post('/generate', function (req, res, next) {

	finalString = '';

	finalString += 'var siteRoot = "' + req.body.siteRoot + '";\n\n';
	finalString += 'module.exports = {\n\n';

	finalString += '\tsiteRoot: "' + req.body.siteRoot + '",\n';
	finalString += '\tgoogleClientID: "' + req.body.appID + '",\n';
	finalString += '\tgoogleClientSecret: "' + req.body.appSecret + '",\n';
	finalString += '\tgoogleCallback: siteRoot + "/dashboard/auth/google/callback",\n';
	finalString += '\tgoogleAdminCallback: siteRoot + "/admin/auth/google/callback",\n';
	finalString += '\tmongooseConnection: "' + req.body.connectionString + '",\n';
	finalString += '\tmailUser: "' + req.body.mail + '",\n';
	finalString += '\tmailRefreshToken: "' + req.body.refreshToken + '",\n';
	finalString += '\tmailPort: "' + req.body.port + '",\n';
	finalString += '\tmailSecure: "' + req.body.secure + '",\n';

	finalString += '\n};';

	res.setHeader('content-type', 'text/javascript');
	res.send(finalString);

});

router.get('/', function (req, res, next) {
	res.render('config-generator');
});

module.exports = router;
