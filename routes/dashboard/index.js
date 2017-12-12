var express = require('express');
var router = express.Router();

var studentsModel = require('../../schemas/students');
var portalsModel = require('../../schemas/portals');
var bugsModel = require('../../schemas/bugs');

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next) {

    var reqPortal = (req.originalUrl.split('/'))[2];

    portalsModel.find({
        name: reqPortal,
        active: true,
        admin: false
    }, function(err, result) {
        if (err) {
            res.render('custom_errors', {
                message: "Server error",
                details: "An unexpected error occoured. Contact Instruction Division software team for assistance.",
                callback: "/"
            });
        }
        if (result.length > 0) {
            next();
        } else {
            res.render('custom_errors', {
                message: 'This portal has been disabled by the Administrator',
                details: 'Contact Instruction Division software team for assistance.',
                callback: "/dashboard"
            });
        }
    });
};

portalsModel.find({
    admin: false
}, function(err, portals) {
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
    studentsModel.find({
        email: id
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        return done(err, result[0]);
    });
});


studentPassport.use(new googleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleCallback,
    passReqToCallback: true
}, function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

router.use(session({
    secret: 'STUDENT-BPHC-ID'
}));
router.use(studentPassport.initialize());
router.use(studentPassport.session());

router.get('/login', studentPassport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', studentPassport.authenticate('google', {
        failureRedirect: '/dashboard/login'
    }),
    function(req, res) {

        studentsModel.find({
            email: req.user.emails[0].value
        }, function(err, result) {
            if (err) {
                res.render('custom_errors', {
                    message: "Server error",
                    details: "An unexpected error occoured. Contact Instruction Division software team for assistance.",
                    callback: "/"
                });
            }
            if (result.length == 0) {
                if (req.user.emails[0].value.endsWith("hyderabad.bits-pilani.ac.in")) {
                    req.session.destroy(function() {
                        res.render('custom_errors', {
                            message: "Un-authorized User",
                            details: "This user is not authorized to access dashboard.",
                            callback: "/"
                        });
                    });
                } else {
                    req.session.destroy(function() {
                        res.render('custom_errors', {
                            message: "Invalid Email.",
                            details: "Please use your institute provided email only.",
                            callback: "/"
                        });
                    });
                }
            } else {
                res.redirect('/dashboard');
            }
        });
    });

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
});

router.get('/portals', function(req, res) {
    res.redirect('/dashboard');
});

/********* studentPassport Config End *********/


/*Add end points for non logged in users above this line*/

router.use(function(req, res, next) {
    if (!(req.user)) {
        res.redirect('/dashboard/login');
    } else {
        next();
    }
});

router.use(function(req, res, next) {
    res.renderState = function(view, params) {
        if (params == undefined || params == null) {
            params = {};
        };
        portalsModel.find({
            admin: false,
            active: true
        }, function(err, portals) {
            if (err) {
                res.render('custom_errors', {
                    message: "Server error",
                    details: "An unexpected error occoured. Contact Instruction Division software team for assistance."
                });
            }

            params['portals'] = portals;
            params['user'] = req.user;
            params['rootURL'] = '/dashboard';
            params['dashboard'] = {
                type: "Student"
            };

            res.render(view, params);
        });
    };
    next();
});

/* Below end points are availible only to logged in users */

router.get('/', function(req, res, next) {
    res.renderState('dashboard/index');
});

router.get('/bug', function(req, res, next) {
    let params = req.params;
    params['categories'] = ['User Interface', 'Feature Request', 'Site Performance', 'Site Operationality', 'Thank You']
    res.renderState('dashboard/bug', params);
});

router.post('/bug', function(req, res, next) {
    let dataStore = {
        category: req.sanitize(req.body.feedbacklist),
        report: req.sanitize(req.body.feedback),
        useragent: req.sanitize(req.headers['user-agent']),
        student: req.session.passport.user
    };
    bugsModel.create(dataStore, function(err, response) {
        if (err) {
            res.renderState('custom_errors', {
                message: "Failure",
                details: err
            });
        }
        res.renderState('custom_errors', {
            message: "Success",
            details: "Stored Report"
        });
    });
});

router.get('/bug/policy', function(req, res, next) {
    res.renderState('dashboard/bug_policy');
});

module.exports = router;