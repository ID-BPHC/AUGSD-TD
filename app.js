var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var fs = require('fs');
var session = require('express-session');
var bugsModel = require('./schemas/bugs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'logo', 'idlogo-short-01.ico')));

var loggermiddleware = require('./middleware/logger');
app.use(loggermiddleware.logsHandler);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (fs.existsSync('./config.js')) {

    var config = require('./config');

    mongoose.connect(config.mongooseConnection, {
    });

    var api = require('./routes/api');
    var admin = require('./routes/admin');
    var dashboard = require('./routes/dashboard');
    var index = require('./routes');

    // var referermiddleware = require('./middleware/referer');
    // app.use(referermiddleware.referHandler);

    // A termination function on any kind of error that occours after login
    app.use(function (req, res, next) {
        res.terminate = function (err) {
            bugsModel.create({
                category: "Site",
                error: err,
                student: req.user.email,
                useragent: req.sanitize(req.headers['user-agent'])
            }, function (err1, bug) {
                if (err1) {
                    console.log(err1);
                    res.end();
                }
                res.render('custom_errors', {
                    redirect: "/",
                    timeout: 5,
                    supertitle: "Critical Breakdown.",
                    message: "Server Error",
                    details: "An unexpected error occoured. Software team has been notified about this. Contact Instruction Division for further assistance."
                });
            });
        };
        next();
    });

    // A function to disable caching on responses
    app.use(function (req, res, next) {
        res.nocache = function () {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        };
        next();
    });

    app.use('/admin', admin);
    app.use('/api', api);
    app.use('/dashboard', dashboard);
    app.use('/', index);

} else {
    var generator = require('./routes/config-generator');
    app.use('/', generator);
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.development = (req.app.get('env') === 'development');
    res.locals.missing = false;
    res.locals.title = "Oh noes";
    res.locals.subtitle = "Our guys have been notified about this.";
    if (err.status == 404) {
        res.locals.missing = true;
        res.locals.title = "404 Couldn't find it";
        res.locals.subtitle = "You sure you typed the link correctly?";
    }

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
