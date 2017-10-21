var siteRoot = "http://localhost:3000";

module.exports = {

	//Misc
	siteRoot: siteRoot,

	//Google APIs
	googleClientID:     '167265165056-dfi5tagvfb79360nngjlhhbocte9kf1t.apps.googleusercontent.com',
    googleClientSecret: '9tLO5NZmi-UFmfdP9AbvmT72',
    googleCallback: siteRoot + "/dashboard/auth/google/callback",
    googleAdminCallback: siteRoot + "/admin/auth/google/callback",

    //Mongoose
    mongooseConnection: "mongodb://127.0.0.1/ID-dev",

    //Nodemailer
    //Get these from http://masashi-k.blogspot.in/2013/06/sending-mail-with-gmail-using-xoauth2.html
    mailUser: "idfeedback@hyderabad.bits-pilani.ac.in",
    mailRefreshToken: "1/ZTdjl-PG6XmwqN4QuJKvBgDxd4Zvg-VlKaacaIUmGyU",
    mailPort: 587,
    mailSecure: false //true for only 465
};