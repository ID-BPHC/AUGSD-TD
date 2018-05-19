var express = require('express');
var filter = require('profanity-filter');
var badwordslist = require('badwords-list');
var fq = require('fuzzquire');
var mailer = fq('utils/mailer');
var router = express.Router();

var coursesModel = require('../../../../schemas/courses');
var adminsModel = require('../../../../schemas/admins');
var studentsModel = require('../../../../schemas/students');
var feedbacksModel = require('../../../../schemas/feedbacks-midsem');
var feedbacks = require('../feedbacks')

router.use('/', feedbacks);

router.post('/step-4', function (req, res, next) {
    try {
        if (req.sanitize(req.body.instructorlist) == '. . .') {
            errorHandler(res, "Invalid Instructor Selected. Please select a valid instructor.");
            
        } else if (typeof req.sanitize(req.body.feedbackMidsem1) == 'undefined' ||
                   typeof req.sanitize(req.body.feedbackMidsem2) == 'undefined') {
             errorHandler(res, "Feedback field wasn't filled. Please fill the feedback field before submitting.");

        }
        let instructorarray = req.session.instructor[0].instructors;
        let courseID = req.session.courseID;
        let courseSection = req.session.courseSection;
        let instructorname = req.sanitize(req.body.instructorlist);
        let feedbackMidsem1 = req.sanitize(req.body.feedbackMidsem1);
        let feedbackMidsem2 = req.sanitize(req.body.feedbackMidsem2);
        let feedbackMidsem3 = req.sanitize(req.body.feedbackMidsem3);
        
        let instructoremail = '';
        instructorarray.forEach(function (element) {
            if (element.name == instructorname) {
                instructoremail = element.email;
            }
        });
        filter.setReplacementMethod('grawlix');
        badwordslist.array.forEach(function (item) {
            filter.addWord(item);
            filter.addWord(item.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }));
            filter.addWord(item.toUpperCase());
        });
        let customfilter = [];
        customfilter.forEach(function (item) {
            filter.addWord(item);
        });
        filter.setGrawlixChars(['']);
        feedbackMidsem1 = filter.clean(feedbackMidsem1);
        feedbackMidsem2 = filter.clean(feedbackMidsem2);
        let dataStore = {
            courseID: courseID,
            section: courseSection,
            instructor: instructoremail, // Instructor's email
            type: "midsem", // 24x7 or midsem
            responses: [feedbackMidsem1, feedbackMidsem2, (feedbackMidsem3 ? feedbackMidsem3 : "NA" )],
            createdOn: Date.now()
        };
        feedbacksModel.create(dataStore, function (err, response) {
            if (err) {
                return res.renderState('custom_errors', {
                    redirect: "/dashboard",
                    timeout: 5,
                    supertitle: "Couldn't submit feedback",
                    message: "Failure",
                    details: err
                });
            }

            mailer.send({
                email: instructoremail,
                subject: "Mid-Semester Feedback",
                body: "Dear " + instructorname + "<p>Instruction Division has received the following qualitative feedback (Mid-Semester) from your students for your course " + courseID + " and section " + courseSection + " through online portal. You may reflect upon the same and do the needful to enhance the overall environment of teaching and learning in your course. Kindly understand that the feedback is the perception of your student and sometimes may not be well written as they are students. You are requested to ignore those feedbacks which you think don't have any relevance. At the same time, Instruction Division would still want to share all the feedback we receive through various means so that you can better understand your students.</p><p><br><b>Q. Which characteristics of this instructor or course have been most valuable to your learning ?</b><br>Ans. " + feedbackMidsem1 + "</p><br><p><b>Q. Which characteristics of this instructor, course, classroom or teaching environment require improvement ?</b><br>Ans. " + feedbackMidsem2 + "</p><br><p>You may access all your feedbacks from the Instruction Division Dashboard by visiting the website.</p>"
            });

            return res.renderState('custom_errors', {
                redirect: "/dashboard",
                timeout: 2,
                supertitle: "Submitted Feedback.",
                message: "Success",
                details: "Your feedback was recorded. Thank you :). Redirecting"
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});
module.exports = router;