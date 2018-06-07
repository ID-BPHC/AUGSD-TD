var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var coursesModel = fq("schemas/courses");
var divisionsModel = fq("schemas/divisions");
var taModel = fq("schemas/ta-application");
var mailer = fq("utils/mailer");

const { check, validationResult } = require("express-validator/check");

router.post(
  "/division/apply",
  [
    check("cgpa")
      .exists()
      .withMessage("No CGPA")
      .isFloat({ min: 0.0, max: 10.0 })
      .withMessage("Invalid CGPA"),
    check("hours")
      .exists()
      .withMessage("No Hours/Week Specified")
      .isFloat()
      .withMessage("Invalid Hours"),
    check("division")
      .exists()
      .withMessage("No Division Specified")
      .not()
      .isEmpty()
      .withMessage("Invalid Division")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }

    var email = req.user.email;
    var cgpa = req.sanitize(req.body.cgpa);
    var division = req.sanitize(req.body.division);
    var hours = req.sanitize(req.body.hours);

    divisionsModel.find({ name: division }, function(err, divisions) {
      if (err) {
        return res.terminate(err);
      }

      if (divisions.length == 0) {
        return res.renderState("custom_errors", {
          redirect: "/dashboard/ta-application/division",
          timeout: 5,
          supertitle: "Invalid Data",
          message: "No Division Found"
        });
      }

      taModel.find({ division: division, student: email, type: "D" }, function(
        err,
        results
      ) {
        if (err) {
          return res.terminate(err);
        }

        if (results.length == 0) {
          taModel.create(
            {
              student: email,
              type: "D",
              cgpa: cgpa,
              hours: hours,
              division: division
            },
            function(err) {
              if (err) {
                return res.terminate(err);
              }

              mailer.send({
                email: req.user.email,
                subject: "TA Application",
                body:
                  "Your application for Teacher Assistant of " +
                  division +
                  " is under process. You can track your application status on Instruction Division's Website."
              });

              return res.renderState("custom_errors", {
                redirect: "/dashboard",
                timeout: 3,
                supertitle: "Request Received",
                message: "Your request has been submitted. Redirecting ..."
              });
            }
          );
        } else {
          return res.renderState("custom_errors", {
            redirect: "/dashboard/ta-application/division",
            timeout: 5,
            supertitle: "Error",
            message:
              "You have already applied as a TA for this division. Redirecting ..."
          });
        }
      });
    });
  }
);

router.post(
  "/course/apply",
  [
    check("cgpa")
      .exists()
      .withMessage("No CGPA")
      .isFloat({ min: 0.0, max: 10.0 })
      .withMessage("Invalid CGPA"),
    check("hours")
      .exists()
      .isFloat()
      .withMessage("Invalid Hours"),
    check("course")
      .exists()
      .not()
      .isEmpty()
      .withMessage("Invalid Course"),
    check("grade")
      .exists()
      .isIn([
        "a",
        "a-",
        "b",
        "b-",
        "c",
        "c-",
        "d",
        "d-",
        "e",
        "e-",
        "f",
        "A",
        "A-",
        "B",
        "B-",
        "C",
        "C-",
        "D",
        "D-",
        "E",
        "E-",
        "F",
        "10",
        "9",
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
        "1",
        "NC"
      ])
      .withMessage("Invalid Grade")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }

    var email = req.user.email;
    var cgpa = req.sanitize(req.body.cgpa);
    var course = req
      .sanitize(req.body.course)
      .split("-")[0]
      .trim();
    var hours = req.sanitize(req.body.hours);

    coursesModel.find({ courseID: course }, function(err, courses) {
      if (err) {
        return res.terminate(err);
      }

      if (courses.length == 0) {
        return res.renderState("custom_errors", {
          redirect: "/dashboard/ta-application/course",
          timeout: 5,
          supertitle: "Invalid Data",
          message: "No Course Found"
        });
      }

      taModel.find({ course: course, student: email, type: "C" }, function(
        err,
        result
      ) {
        if (err) {
          return res.terminate(err);
        }

        if (result.length == 0) {
          taModel.create(
            {
              student: email,
              type: "C",
              cgpa: cgpa,
              hours: hours,
              course: course
            },
            function(err) {
              if (err) {
                return res.terminate(err);
              }

              mailer.send({
                email: req.user.email,
                subject: "TA Application",
                body:
                  "Your application for Teacher Assistant of " +
                  course +
                  " is under process. You can track your application status on Instruction Division's Website."
              });

              return res.renderState("custom_errors", {
                redirect: "/dashboard",
                timeout: 3,
                supertitle: "Request Received",
                message: "Your request has been submitted. Redirecting ..."
              });
            }
          );
        } else {
          return res.renderState("custom_errors", {
            redirect: "/dashboard/ta-application/course",
            timeout: 5,
            supertitle: "Error",
            message:
              "You have already applied as a TA for this course. Redirecting ..."
          });
        }
      });
    });
  }
);

router.get("/division", function(req, res, next) {
  divisionsModel
    .find({})
    .sort({ name: 1 })
    .exec(function(err, divisions) {
      if (err) {
        res.terminate(err);
      }
      res.renderState("dashboard/portals/ta-application/apply-division", {
        divisions: divisions
      });
    });
});

router.get("/view", function(req, res, next) {
  taModel.find({ student: req.user.email, type: "C" }, function(err, course) {
    if (err) {
      return res.terminate(err);
    }
    taModel.find({ student: req.user.email, type: "D" }, function(
      err,
      division
    ) {
      if (err) {
        return res.terminate(err);
      }
      return res.renderState("dashboard/portals/ta-application/view", {
        cTAs: course,
        dTAs: division
      });
    });
  });
});

router.get("/cancel/:id", function(req, res, next) {
  taModel.remove(
    { _id: req.sanitize(req.params.id), student: req.user.email },
    function(err) {
      if (err) {
        return res.terminate(err);
      }

      mailer.send({
        email: req.user.email,
        subject: "TA Application Cancelled",
        body: "You cancelled your TA Application"
      });

      res.redirect("/dashboard/ta-application/view");
    }
  );
});

router.get("/course", function(req, res, next) {
  coursesModel
    .find({})
    .sort({
      courseID: 1
    })
    .exec(function(err, courses) {
      if (err) {
        res.terminate(err);
      }
      res.renderState("dashboard/portals/ta-application/apply-course", {
        courses: courses
      });
    });
});

router.get("/", function(req, res, next) {
  res.renderState("dashboard/portals/ta-application");
});

module.exports = router;
