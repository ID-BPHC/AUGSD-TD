var express = require('express');
var router = express.Router();

var studentsModel = require('../../schemas/students');
var portalsModel = require('../../schemas/portals');

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next){

    var reqPortal = (req.originalUrl.split('/'))[2];

    portalsModel.find({ name: reqPortal, active: true, admin: false }, function(err, result){
        if(err) {
            res.render('custom_errors', {message: "Server error", details: "An unexpected error occoured. Contact Instruction Division software team for assistance."});
        }
        if(result.length > 0) {
        	next();
        } else {
            res.render('custom_errors', {message: 'This portal has been disabled by the Administrator', details: 'Contact Instruction Division software team for assistance.'});
        }
    });
};

portalsModel.find({ admin: false }, function(err, portals){
    portals.forEach(function(portal) {
        var portalPath = require('./portals/' + portal.name);
        router.use('/' + portal.name, securityCheck, portalPath);
    });
});

/* Portal Middleware Configuration End */

/********* Configure studentPassport *********/
var passport = require('passport');
var studentPassport = new passport.Passport();
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session');
var keys = require('../../config');

studentPassport.serializeUser(function(user, done) {
	return done(null, user.emails[0].value);
});

studentPassport.deserializeUser(function(id, done) {
	studentsModel.find({email: id}, function(err, result){
		if(err) {
            console.log(err);
        }
		return done(err, result[0]);
	});
});


studentPassport.use(new googleStrategy({
	clientID:     keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleCallback,
    passReqToCallback   : true
	}, function(request, accessToken, refreshToken, profile, done){
		return done(null, profile);
}));

router.use(session({ secret: 'STUDENT-BPHC-ID' }));
router.use(studentPassport.initialize());
router.use(studentPassport.session());

router.get('/login', studentPassport.authenticate('google', { scope: ['profile', 'email']}));

router.get('/auth/google/callback', 
  studentPassport.authenticate('google', { failureRedirect: '/dashboard/login' }),
  function(req, res) {

    studentsModel.find({email: req.user.emails[0].value}, function(err, result){
    	if(err){
    		res.render('custom_errors', {message: "Server error", details: "An unexpected error occoured. Contact Instruction Division software team for assistance."});
    	}
    	if(result.length == 0){
    		req.session.destroy(function(){
    			res.render('custom_errors', {message: "Invalid Email.", details: "Please use your institute provided email only."});
    		});
    	} else {
    		res.redirect('/dashboard');
    	}
    });
 });

router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		res.redirect('/');
	});
});

/********* studentPassport Config End *********/


/*Add end points for non logged in users above this line*/

router.use(function(req, res, next){
	if(!(req.user)){
		res.redirect('/dashboard/login');
	} else {
        next();
    }	
});

router.use(function(req, res, next) {
    res.renderState = function(view, params = {}){
        portalsModel.find({admin: false, active: true}, function(err, portals){
            if(err){
                res.render('custom_errors', {message: "Server error", details: "An unexpected error occoured. Contact Instruction Division software team for assistance."});
            }

            params['portals'] = portals;
            params['user'] = req.user;
            params['rootURL'] = '/dashboard';

            res.render(view, params);
        });
    };
    next();
});

/* Below end points are availible only to logged in users */

router.get('/', function(req, res, next) {
 	res.renderState('dashboard/index');
});

module.exports = router;
