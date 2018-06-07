var express = require("express");
var filter = require("profanity-filter");
var badwordslist = require("badwords-list");
var fq = require("fuzzquire");
var mailer = fq("utils/mailer");
var router = express.Router();

var coursesModel = require("../../../../schemas/courses");
var adminsModel = require("../../../../schemas/admins");
var studentsModel = require("../../../../schemas/students");
var feedbacksModel = require("../../../../schemas/feedbacks-midsem");

router.get("/", function(req, res, next) {
  res.renderState("dashboard/portals/feedbacks-midsem");
});

router.get("/step-1", function(req, res, next) {
  res.renderState("dashboard/portals/feedbacks-midsem/step1");
});

router.get("/step-2", function(req, res, next) {
  res.redirect("/dashboard/feedbacks-midsem");
});

router.get("/step-3", function(req, res, next) {
  res.redirect("/dashboard/feedbacks-midsem");
});

router.post("/step-2", function(req, res, next) {
  try {
    if (req.sanitize(req.body.courselist) == ". . .") {
      res.renderState("custom_errors", {
        redirect: "/dashboard/feedbacks-midsem/step-1",
        timeout: 2,
        supertitle: ".",
        callback: "/",
        message: "Validation Error",
        details: "Invalid Course Selected. Please select a valid course."
      });
    }
    let courseSearch = coursesModel.find(
      {
        courseID: req.sanitize(req.body.courselist)
      },
      function(err, result) {
        if (err) {
          return res.terminate(err);
        }
        return result;
      }
    );
    courseSearch
      .then(function retrieveStudent(data) {
        let coursedata = req.user.courses;
        for (let i = 0; i < coursedata.length; i++) {
          if (coursedata[i].courseID == data[0].courseID) {
            return req.user.courses[i].sections;
          }
        }
      })
      .then(function saveCourseID(data) {
        req.session.courseID = req.sanitize(req.body.courselist);
        req.session.save();
        return data;
      })
      .then(function renderStep(data) {
        res.renderState("dashboard/portals/feedbacks-midsem/step2", {
          params: data,
          courseID: req.sanitize(req.body.courselist)
        });
      });
  } catch (err) {
    return res.terminate(err);
  }
});

router.post("/step-3", function(req, res, next) {
  try {
    if (req.sanitize(req.body.courselist) == ". . .") {
      res.renderState("custom_errors", {
        redirect: "/dashboard/feedbacks-midsem/step-1",
        timeout: 2,
        supertitle: ".",
        callback: "/",
        message: "Validation Error",
        details: "Invalid Class Selected. Please select a valid class."
      });
    }
    let courseSection = req
      .sanitize(req.body.courselist)
      .split("-")[1]
      .replace(" ", "");
    req.session.courseSection = courseSection;
    req.session.save();
    let courseSearch = coursesModel.aggregate([
      {
        $match: {
          $and: [
            {
              courseID: req.session.courseID
            },
            {
              "sections.section": courseSection
            }
          ]
        }
      },
      {
        $project: {
          sections: {
            $filter: {
              input: "$sections",
              as: "item",
              cond: {
                $eq: ["$$item.section", courseSection]
              }
            }
          },
          _id: 0
        }
      }
    ]);
    courseSearch
      .then(function getInstructorName(data) {
        let newdata = {
          instructors: []
        };

        function getInstructorNameProcedure(i) {
          return new Promise((resolve, reject) => {
            adminsModel.find(
              {
                email: data[0].sections[0].instructors[i]
              },
              function(err, email) {
                if (err) {
                  return res.terminate(err);
                }
                newdata.instructors[i] = {
                  name: email[0].name,
                  email: data[0].sections[0].instructors[i]
                };
                resolve(newdata);
              }
            );
          });
        }
        let promises = [];
        for (let i = 0; i < data[0].sections[0].instructors.length; i++) {
          promises.push(getInstructorNameProcedure(i));
        }
        return Promise.all(promises);
      })
      .then(function saveInstructorData(data) {
        req.session.instructor = data;
        req.session.save();
        return data;
      })
      .then(function renderStep(data) {
        res.renderState("dashboard/portals/feedbacks-midsem/step3", {
          params: data[0].instructors,
          courseID: req.session.courseID,
          courseSection: req.session.courseSection
        });
      });
  } catch (err) {
    return res.terminate(err);
  }
});

router.post("/step-4", function(req, res, next) {
  try {
    if (req.sanitize(req.body.instructorlist) == ". . .") {
      return res.renderState("custom_errors", {
        redirect: "/dashboard/feedbacks-midsem/step-1",
        timeout: 2,
        supertitle: ".",
        callback: "/",
        message: "Validation Error",
        details:
          "Invalid Instructor Selected. Please select a valid instructor."
      });
    } else if (
      typeof req.sanitize(req.body.feedbackMidsem1) == "undefined" ||
      typeof req.sanitize(req.body.feedbackMidsem2) == "undefined"
    ) {
      return res.renderState("custom_errors", {
        redirect: "/dashboard/feedbacks-midsem/step-1",
        timeout: 2,
        supertitle: ".",
        callback: "/",
        message: "Validation Error",
        details:
          "Feedback field wasn't filled. Please fill the feedback field before submitting."
      });
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
    filter.setReplacementMethod("grawlix");
    badwordslist.array.forEach(function(item) {
      filter.addWord(item);
      filter.addWord(
        item.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        })
      );
      filter.addWord(item.toUpperCase());
    });
    let customfilter = [];
    customfilter.forEach(function(item) {
      filter.addWord(item);
    });
    filter.setGrawlixChars([""]);
    feedbackMidsem1 = filter.clean(feedbackMidsem1);
    feedbackMidsem2 = filter.clean(feedbackMidsem2);
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
          "<p>Instruction Division has received the following qualitative feedback (Mid-Semester) from your students for your course " +
          courseID +
          " and section " +
          courseSection +
          " through online portal. You may reflect upon the same and do the needful to enhance the overall environment of teaching and learning in your course. Kindly understand that the feedback is the perception of your student and sometimes may not be well written as they are students. You are requested to ignore those feedbacks which you think don't have any relevance. At the same time, Instruction Division would still want to share all the feedback we receive through various means so that you can better understand your students.</p><p><br><b>Q. Which characteristics of this instructor or course have been most valuable to your learning ?</b><br>Ans. " +
          feedbackMidsem1 +
          "</p><br><p><b>Q. Which characteristics of this instructor, course, classroom or teaching environment require improvement ?</b><br>Ans. " +
          feedbackMidsem2 +
          "</p><br><p>You may access all your feedbacks from the Instruction Division Dashboard by visiting the website.</p>"
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
