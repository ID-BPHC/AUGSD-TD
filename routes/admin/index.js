var express = require('express');
var router = express.Router();

var adminsModel = require('../../schemas/admins');
var portalsModel = require('../../schemas/portals');

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next){

    var reqPortal = (req.originalUrl.split('/'))[2];

    portalsModel.find({ name: reqPortal, active: true }, function(err, result){
        if(err) {
            res.render('custom_errors', {message: "Server error", details: "An unexpected error occoured. Contact Instruction Division software team for assistance."});
        }
        if(result.length > 0 || req.user.superUser) {
            if(req.user.portals.indexOf(reqPortal) >= 0 || req.user.superUser){
                next();
            } else {
                res.render('custom_errors', {message: 'You do not have permission to access this portal', details: 'Contact Instruction Division software team for assistance.'});
            }
        } else {
            res.render('custom_errors', {message: 'This portal has been disabled by the Administrator', details: 'Contact Instruction Division software team for assistance.'});
        }
    });
};

portalsModel.find({ admin: true }, function(err, portals){
    portals.forEach(function(portal) {
        var portalPath = require('./portals/' + portal.name);
        router.use('/' + portal.name, securityCheck, portalPath);
    });
});

/* Portal Middleware Configuration End */

/********* Configure Passport *********/
var passport = require('passport');
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session');
var keys = require('../../config');

passport.serializeUser(function(user, done) {
  done(null, user.emails[0].value);
});

passport.deserializeUser(function(id, done) {
	adminsModel.find({email: id}, function(err, result){
		done(err, result[0]);
	});
});


passport.use(new googleStrategy({
	clientID:     keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleAdminCallback,
    passReqToCallback   : true
	}, function(request, accessToken, refreshToken, profile, done){
		return done(null, profile);
}));

router.use(session({ secret: 'ID-BITS-HYD BPHC BITS' }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/login', passport.authenticate('google', { scope: ['profile', 'email']}));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {

    adminsModel.find({email: req.user.emails[0].value}, function(err, result){
    	if(err){
    		res.render('custom_errors', {message: "Server error", details: "An unexpected error occoured. Contact Instruction Division software team for assistance."});
    	}
    	if(result.length == 0){
    		req.session.destroy(function(){
    			res.render('custom_errors', {message: "You are not an administrator", details: "This google account is not registered as an administrator."});
    		});
    	} else {
    		res.redirect('/admin' + result[0].home);
    	}
    });
 });

router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		res.redirect('/');
	});
});

/********* Passport Config End *********/


/*Add end points for non logged in users above this line*/

router.use(function(req, res, next){
	if(!(req.user)){
		res.redirect('/admin/login');
	} else {
        next();
    }	
});

/* Below end points are availible only to logged in users */

router.get('/', function(req, res, next) {
 	res.render('custom_errors', {message: "Welcome, " + req.user.name});
});

module.exports = router;
