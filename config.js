var siteRoot = "http://localhost:3000";
// var siteRoot = "https://augsd-cg-transcripts.herokuapp.com"  // for herkou

module.exports = {
  //Misc
  siteRoot: siteRoot,
  fileStorage: "",
  siteMode: "AUGSD", // TD or AUGSD
  port: "3000",
  inductionBatchPrefixes: ["20"],

  //Redis
  redisHost: "localhost",
  redisPort: 6379,
  redisPass: "",

  //Google APIs
  googleClientID:
    "441610405045-1m73rk0b0fs9oh6rch5f9iesiehcqsek.apps.googleusercontent.com",
  googleClientSecret: "en6xOYfjQimcRT2mIvaaKi3k",
  googleCallback: siteRoot + "/dashboard/auth/google/callback",
  googleAdminCallback: siteRoot + "/admin/auth/google/callback",

  //Mongoose
  mongooseConnection:
    "mongodb+srv://root:divyanshu@hereisdx-khs4b.mongodb.net/ID-dev?retryWrites=true&w=majority",

  //Nodemailer
  mailUser: "YOUR_EMAIL",
  mailRefreshToken: "YOUR_EMAIL_REFRESH_TOKEN",
  mailPort: 465,
  mailSecure: true,

  authSecretStudent: "STUDENT",
  authSecretAdmin: "ADMIN"
};
