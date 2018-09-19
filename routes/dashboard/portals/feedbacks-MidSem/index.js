var express = require("express");
var fq = require("fuzzquire");
var mailer = fq("utils/mailer");
var router = express.Router();

var coursesModel = fq("schemas/courses");
var adminsModel = fq("schemas/admins");
var studentsModel = fq("schemas/students");
var feedbacksModel = fq("schemas/feedbacks");
var feedbacks = require("./../feedbacks");

["/", "/step-1"].forEach(step => {
  router.get(step, feedbacks);
});

router.post("/step-2", feedbacks);
router.post("/step-3", feedbacks);

let errorHandler = function(req, res, message) {
  let link = req.originalUrl.split("/");
  return res.renderState("custom_errors", {
    redirect: link[0] + "/" + link[1] + "/" + link[2] + "/step-1",
    timeout: 2,
    supertitle: ".",
    callback: "/",
    message: "Validation Error",
    details: message
  });
};

router.post("/step-4", function(req, res, next) {
  try {
    if (req.sanitize(req.body.instructorlist) == ". . .") {
      errorHandler(
        req,
        res,
        "Invalid Instructor Selected. Please select a valid instructor."
      );
    } else if (
      typeof req.sanitize(req.body.feedbackMidsem1) == "undefined" ||
      typeof req.sanitize(req.body.feedbackMidsem2) == "undefined"
    ) {
      errorHandler(
        req,
        res,
        "Feedback field wasn't filled. Please fill the feedback field before submitting."
      );
    }
    let instructorarray = req.session.instructor[0].instructors;
    let courseID = req.session.courseID;
    let courseSection = req.session.courseSection;
    let instructorname = req.sanitize(req.body.instructorlist);
    let feedbackMidsem1 = req.sanitize(req.body.feedbackMidsem1);
    let feedbackMidsem2 = req.sanitize(req.body.feedbackMidsem2);
    let feedbackMidsem3 = req.sanitize(req.body.feedbackMidsem3);

    let instructoremail = "";
    instructorarray.forEach(function(element) {
      if (element.name == instructorname) {
        instructoremail = element.email;
      }
    });
    let dataStore = {
      courseID: courseID,
      section: courseSection,
      instructor: instructoremail, // Instructor's email
      type: "midsem", // 24x7 or midsem
      responses: [
        feedbackMidsem1,
        feedbackMidsem2,
        feedbackMidsem3 ? feedbackMidsem3 : "NA"
      ],
      createdOn: Date.now()
    };
    feedbacksModel.create(dataStore, function(err, response) {
      if (err) {
        return res.renderState("custom_errors", {
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
        body:
          "Dear " +
          instructorname +
          "<p>Timetable Division has received the following qualitative feedback (Mid-Semester) from your students for your course " +
          courseID +
          " and section " +
          courseSection +
          " through online portal. You may reflect upon the same and do the needful to enhance the overall environment of teaching and learning in your course. Kindly understand that the feedback is the perception of your student and sometimes may not be well written as they are students. You are requested to ignore those feedbacks which you think don't have any relevance. At the same time, Timetable Division would still want to share all the feedback we receive through various means so that you can better understand your students.</p><p><br><b>Q. Which characteristics of this instructor or course have been most valuable to your learning ?</b><br>Ans. " +
          feedbackMidsem1 +
          "</p><br><p><b>Q. Which characteristics of this instructor, course, classroom or teaching environment require improvement ?</b><br>Ans. " +
          feedbackMidsem2 +
          "</p><br><p>You may access all your feedbacks from the Timetable Division Dashboard by visiting the website.</p>"
      });

      return res.renderState("custom_errors", {
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
