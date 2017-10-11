var siteRoot = "http://localhost:3000";

module.exports = {
	siteRoot: siteRoot,
	googleClientID:     '167265165056-dfi5tagvfb79360nngjlhhbocte9kf1t.apps.googleusercontent.com',
    googleClientSecret: '9tLO5NZmi-UFmfdP9AbvmT72',
    googleCallback: siteRoot + "/auth/google/callback",
    googleAdminCallback: siteRoot + "/admin/auth/google/callback",
    mongooseConnection: "mongodb://127.0.0.1/ID-dev"
};