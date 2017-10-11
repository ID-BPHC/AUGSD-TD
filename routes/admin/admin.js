var express = require('express');
var router = express.Router();
var adminsModel = require('./schemas/admins');


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
		done(err, result);
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
    		res.render('custom_errors', {message: "Server error"});
    	}
    	if(result.length == 0){
    		req.session.destroy(function(){
    			res.render('custom_errors', {message: "You are not an administrator"});
    		});
    	} else {
    		res.redirect('/admin');
    	}
    });
 });

router.get('/logout', function(req, res){
	req.session.destroy(function(err){
		res.redirect('/');
	});
});

/********* Passport Config End *********/


/*Add end points for non logged in users here*/

router.use(function(req, res, next){
	if(!(req.user)){
		res.redirect('/admin/login');
	}	
	next();
});


/* Below end points are availible only to logged in users */
router.get('/', function(req, res, next) {
 	res.render('custom_errors', {message: "Welcome, " + req.user[0].name});
});

module.exports = router;
