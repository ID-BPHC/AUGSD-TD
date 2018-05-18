var express = require('express');
var router = express.Router();
var session = require('express-session');

var adminsModel = require('../../schemas/admins');
var portalsModel = require('../../schemas/portals');
var settingsModel = require('../../schemas/settings');
var coursesModel = require('../../schemas/courses');


router.use(function (req, res, next) {
    res.renderState = function (view, params = {}) {
        portalsModel.find({
            admin: true,
            active: true
        }, function (err, portals) {
            if (err) {
                return res.terminate(err);
            }
            if (typeof (req.originalUrl.split('/'))[1] !== 'undefined') {
                params.reqPortal = (req.originalUrl.split('/'))[1];
            }
            if (typeof (req.originalUrl.split('/'))[2] !== 'undefined') {
                params.reqPortal = (req.originalUrl.split('/'))[2];
            }
            params.profileImage = req.session.profileImage;
            params.portals = portals;
            params.user = req.user;
            params.rootURL = '/admin';
            params.switched = req.session.switched;
            params.dashboard = {
                type: "Administrator"
            };

            res.render(view, params);
        });
    };
    next();
});



let  getCourseByInstructor = function (instructorEmailId){
    return new Promise((resolve,reject)=>{

    coursesModel.find({
        "sections.instructors":{$in:[instructorEmailId]}}
        ,{}
        ,function(err,courses){

        resolve(courses);
        reject("error in finding courses");
    })
})} 
router.get('/',(req,res)=>{
    
    getCourseByInstructor(req.user.email).then((courses)=>{
        
        res.renderState('admin/profile',{
            courses: courses
        });
        
    }).catch(err=>{
        console.log("error is  : "+err)
    })
});

module.exports = router;