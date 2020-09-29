let express = require("express");
let fq = require("fuzzquire");
let mailer = fq("utils/mailer");
let router = express.Router();

let feedbacksModel = fq("schemas/feedbacks");
let feedbacks = require("./../feedbacks");

let config = require("../../../../config");

["/", "/step-1"].forEach((step) => {
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
    details: message,
  });
};

router.post("/step-4", function(req, res, next) {
  try {
    if (
      !req.sanitize(req.body.feedback) ||
      req.sanitize(req.body.feedback).trim() === ""
    ) {
      errorHandler(
        req,
        res,
        "Feedback field wasn't filled. Please fill the feedback field before submitting."
      );
    } else {
      let instructorarray = req.session.instructor[0].instructors;
      let courseID = req.session.courseID;
      let courseSection = req.session.courseSection;
      let instructorname = req.sanitize(req.body.instructorlist);
      let feedback = req.sanitize(req.body.feedback);
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
        type: "24x7", // 24x7 or midsem
        responses: feedback,
        createdOn: Date.now(),
      };
      feedbacksModel.create(dataStore, function(err, response) {
        if (err) {
          res.renderState("custom_errors", {
            redirect: "/dashboard",
            timeout: 5,
            supertitle: "Couldn't submit feedback",
            message: "Failure",
            details: err,
          });
        }
        if (config.sendFeedbackMailToProf) {
          mailer.send({
            email: instructoremail,
            subject: "Feedback 24x7",
            body:
              "Dear " +
              instructorname +
              "<p>AUGSD has received the following qualitative feedback from your students for your course " +
              courseID +
              " and section " +
              courseSection +
              " through 24 X 7 online portal. You may reflect upon the same and do the needful to enhance the overall environment of teaching and learning in your course. Kindly understand that the feedback is the perception of your student and sometimes may not be well written as they are students. You are requested to ignore those feedbacks which you think don't have any relevance. At the same time, AUGSD would still want to share all the feedback we receive through various means so that you can better understand your students.</p><p><b>" +
              feedback +
              "</b></p>",
          });
        }
        res.renderState("custom_errors", {
          redirect: "/dashboard",
          timeout: 2,
          supertitle: "Submitted Feedback.",
          message: "Success",
          details: "Your feedback was recorded. Thank you :). Redirecting",
        });
      });
    }
  } catch (err) {
    console.log(err);
    return res.terminate(err);
  }
});
module.exports = router;
