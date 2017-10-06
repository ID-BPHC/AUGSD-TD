var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Configure passport

var passport = require('passport');
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session');
var keys = require('./auth.js');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	return done(null, {
		'status': 'logged in'
	});
});


passport.use(new googleStrategy({
	clientID:     keys.clientID,
    clientSecret: keys.clientSecret,
    callbackURL: keys.callbackURL,
    passReqToCallback   : true
	}, function(request, accessToken, refreshToken, profile, done){
		return done(null, profile);
}));

app.use(session({ secret: 'ID-BITS-HYD BPHC BITS' }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('google', { scope: ['openid', 'profile', 'email']}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
  	console.log("****** Logged in ******");
  	console.log(req.user);
    res.redirect('/');
 });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
