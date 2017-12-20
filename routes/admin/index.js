var express = require('express');
var router = express.Router();

var adminsModel = require('../../schemas/admins');
var portalsModel = require('../../schemas/portals');
var settingsModel = require('../../schemas/settings');

var auth = require('../../middleware/auth');

/* Configure middleware for portal permissions */

let securityCheck = function(req, res, next) {

    var reqPortal = (req.originalUrl.split('/'))[2];

    portalsModel.find({
        name: reqPortal,
        active: true,
        admin: true
    }, function(err, result) {
        if (err) {
            res.render('custom_errors', {
                message: "Server error",
                details: "An unexpected error occoured. Contact Instruction Division software team for assistance."
            });
        }
        if (result.length > 0 || req.user.superUser) {
            if (req.user.portals.indexOf(reqPortal) >= 0 || req.user.superUser) {
                next();
            } else {
                res.render('custom_errors', {
                    message: 'You do not have permission to access this portal',
                    details: 'Contact Instruction Division software team for assistance.'
                });
            }
        } else {
            res.render('custom_errors', {
                message: 'This portal has been disabled by the Administrator',
                details: 'Contact Instruction Division software team for assistance.'
            });
        }
    });
};

portalsModel.find({
    admin: true
}, function(err, portals) {
    portals.forEach(function(portal) {
        var portalPath = require('./portals/' + portal.name);
        router.use('/' + portal.name, securityCheck, portalPath);
    });
});

/* Portal Middleware Configuration End */

/********* Configure adminPassport *********/

router.get('/login', auth.adminPassport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback',
    auth.adminPassport.authenticate('google', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        settingsModel.find({
            name: "config"
        }, function(err, result) {
            if (err) {
                res.render('custom_errors', {
                    message: "Server Connection Error",
                    details: "Server Connection Error has occured"
                });
            }
            if (result.length == 0) {
                var CreateAdmin = adminsModel.create({
                    email: req.user.emails[0].value,
                    name: req.user.displayName,
                    superUser: true
                });
                var SettingsAdd = settingsModel.create({
                    name: "config",
                    description: "Sets the Super Admin during first run.",
                    value: [req.user.emails[0].value]
                });
                var CheckAdmin = (function() {
                    req.session.destroy(function() {
                        res.redirect('/admin/login');
                    });
                });
                var AfterCreateAdmin = CreateAdmin.then(SettingsAdd).then(CheckAdmin);
            } else {
                adminsModel.find({
                    email: req.user.emails[0].value
                }, function(err, result) {
                    if (err) {
                        res.render('custom_errors', {
                            message: "Server error",
                            details: "An unexpected error occoured. Contact Instruction Division software team for assistance."
                        });
                    }
                    if (result.length == 0) {
                        req.session.destroy(function() {
                            res.render('custom_errors', {
                                message: "You are not an administrator",
                                details: "This google account is not registered as an administrator."
                            });
                        });
                    } else {
                        req.session.profileImage = req.sanitize(req.user._json.image.url);
                        req.session.userType = "admin";
                        res.redirect('/admin');
                    }
                });
            }
        });
    });

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
});

/********* adminPassport Config End *********/


/*Add end points for non logged in users above this line*/

router.use(function(req, res, next) {
    if (!(req.user)) {
        res.redirect('/admin/login');
    } else {
        next();
    }
});

router.use(function(req, res, next) {
    if (!(req.session.userType === "admin")) {
        req.session.destroy(function(err) {
            res.redirect('/admin/login');
        });
    } else {
        next();
    }
});

/* Below end points are availible only to logged in users */

router.use(function(req, res, next) {
    res.renderState = function(view, params = {}) {
        portalsModel.find({
            admin: true,
            active: true
        }, function(err, portals) {
            if (err) {
                res.render('custom_errors', {
                    message: "Server error",
                    details: "An unexpected error occoured. Contact Instruction Division software team for assistance."
                });
            }
            params.profileImage = req.session['profileImage'];
            params.portals = portals;
            params.user = req.user;
            params.rootURL = '/admin';
            params.dashboard = {
                type: "Administrator"
            };

            res.render(view, params);
        });
    };
    next();
});

router.get('/', function(req, res, next) {
    res.renderState('admin/index');
});

module.exports = router;