const nodemailer = require('nodemailer');
const config = require('../config');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: config.mailPort,
    secure: config.mailSecure,
    auth: {
    		type: 'OAuth2',
        	user: config.mailUser,
        	clientId: config.googleClientID,
        	clientSecret: config.googleClientSecret,
        	refreshToken: config.mailRefreshToken
    }
});

module.exports = {
	send: function(params){
		var mailOptions = {
			from: config.mailUser,
			to: params.email,
			subject: params.subject,
			text: params.body
		};

		transporter.sendMail(mailOptions, function(err, info) {
			if(err) {
				console.log("*****Error******");
				console.log(err);
				return false;			
			}
			else {
				return true;
			}
		});
	}
};
