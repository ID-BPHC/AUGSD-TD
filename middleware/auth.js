var passport = require('passport');
var userPassport = new passport.Passport();
var adminPassport = new passport.Passport();
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var keys = require('../config');
var studentsModel = require('../schemas/students');
var adminsModel = require('../schemas/admins');

userPassport.serializeUser(function (user, done) {
    return done(null, user.emails[0].value);
});

userPassport.deserializeUser(function (id, done) {
    studentsModel.find({
        email: id
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        return done(err, result[0]);
    });
});

userPassport.use(new googleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleCallback,
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

adminPassport.serializeUser(function (user, done) {
    return done(null, user.emails[0].value);
});

adminPassport.deserializeUser(function (req, id, done) {

    if (req.session.switched) {
        adminsModel.find({
            email: req.session.newUser
        }, function (err, result) {
            if (err) {
                console.log(err);
            }
            return done(err, result[0]);
        });
    } else {
        adminsModel.find({
            email: id
        }, function (err, result) {
            if (err) {
                console.log(err);
            }
            return done(err, result[0]);
        });
    }

});


adminPassport.use(new googleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleAdminCallback,
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

module.exports = {
    userPassport: userPassport,
    adminPassport: adminPassport
};
