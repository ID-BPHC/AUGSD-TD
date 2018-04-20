var siteRoot = "http://localhost:3000";

module.exports = {

    //Misc
    siteRoot: siteRoot,
    fileStorage: "",

    //Google APIs
    googleClientID: 'YOUR_CLIENT_ID',
    googleClientSecret: 'YOUR_CLIENT_SECRET',
    googleCallback: siteRoot + "/dashboard/auth/google/callback",
    googleAdminCallback: siteRoot + "/admin/auth/google/callback",

    //Mongoose
    mongooseConnection: "mongodb://127.0.0.1/ID-dev",

    //Nodemailer
    mailUser: "YOUR_EMAIL",
    mailRefreshToken: "YOUR_EMAIL_REFRESH_TOKEN",
    mailPort: 465,
    mailSecure: true,

};
