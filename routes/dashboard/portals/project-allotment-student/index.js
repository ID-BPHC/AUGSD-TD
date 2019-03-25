var express = require("express");
var router = express.Router();

var fq = require("fuzzquire");
var mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
var path = require("path");
var mailer = fq("utils/mailer");
const settingsModel = fq("schemas/settings");

var courseData = require("./courseData");
var adminsModel = fq("schemas/admins");
var projectsModel = fq("schemas/projects");
var applicationsModel = fq("schemas/project-applications");

router.use(function(req, res, next) {
  function forbidOrNot(email) {
    let forbid = false; // don't forbid
    forbiddenBatches.forEach(batch => {
      if (email.indexOf(batch) == 1) forbid = true;
    });
    return forbid;
  }
  let forbiddenBatches = [];
  settingsModel.find(
    {
      name: "proj-allotment-forbidden-batches"
    },
    function(err, docs) {
      if (docs[0]) {
        forbiddenBatches = docs[0].value;
        if (forbidOrNot(req.user.email)) {
          return res.renderState("custom_errors", {
            redirect: "/dashboard",
            timeout: 2,
            supertitle: "Not Eligible",
            message: "Your Batch is not eligible for project type courses",
            details: " "
          });
        } else {
          next();
        }
      } else {
        next();
      }
    }
  );
});

router.get("/faq", function(req, res, next) {
  res.sendFile(path.join(__dirname, "./faq.pdf"));
});

router.get("/view/:id", function(req, res, next) {
  projectsModel.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.sanitize(req.params.id))
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "instructor",
          foreignField: "email",
          as: "instructorForeign"
        }
      },
      {
        $project: {
          department: "$instructorForeign.department",
          departmentCode: "$instructorForeign.departmentCode",
          instructorName: "$instructorForeign.name",
          title: 1,
          description: 1,
          instructor: 1,
          name: 1,
          updated: 1,
          type: 1
        }
      },
      {
        $unwind: "$department"
      },
      {
        $unwind: "$instructorName"
      }
    ],
    function(err, project) {
      if (err) {
        console.log(err);
        return res.terminate("Error: Could not find project");
      }

      if (project.length == 0) {
        return res.renderState("custom_errors", {
          redirect: "/dashboard/project-allotment-student",
          timeout: 2,
          supertitle: ".",
          message: "Project Not Found",
          details: "Invalid Project ID"
        });
      } else {
        applicationsModel.find(
          {
            project: mongoose.Types.ObjectId(req.sanitize(req.params.id)),
            student: req.sanitize(req.user.email)
          },
          function(err, applications) {
            if (err) {
              console.log(err);
              return res.terminate(
                "Could not check application status for form generation"
              );
            }
            return res.renderState(
              "dashboard/portals/project-allotment-student/view-project",
              {
                project: project[0],
                generateForm: applications.length == 0 ? true : false,
                courses: courseData[project[0].departmentCode][project[0].type]
              }
            );
          }
        );
      }
    }
  );
});

router.get("/view", function(req, res, next) {
  adminsModel.distinct("department", function(err, departments) {
    if (err) {
      console.log(err);
      return res.terminate("Could not find departments");
    }
    departments = departments.filter(function(department) {
      if (department) return department;
    });
    return res.renderState(
      "dashboard/portals/project-allotment-student/select-department",
      {
        departments: departments
      }
    );
  });
});

router.post("/view", function(req, res, next) {
  projectsModel.aggregate(
    [
      {
        $lookup: {
          from: "admins",
          localField: "instructor",
          foreignField: "email",
          as: "instructorForeign"
        }
      },
      {
        $project: {
          department: "$instructorForeign.department",
          instructorName: "$instructorForeign.name",
          title: 1,
          instructor: 1,
          name: 1,
          updated: 1,
          type: 1,
          visible: 1
        }
      },
      {
        $unwind: "$department"
      },
      {
        $unwind: "$instructorName"
      },
      {
        $match: {
          department: req.body.departments,
          visible: true
        }
      },
      {
        $sort: {
          updated: -1
        }
      }
    ],
    function(err, projects) {
      if (err) {
        console.log(err);
        return res.terminate("Aggregate Error");
      }
      return res.renderState(
        "dashboard/portals/project-allotment-student/view-department",
        {
          projects: projects,
          department: req.body.departments
        }
      );
    }
  );
});

router.post(
  "/apply/:id",
  [
    check("cgpa")
      .exists()
      .withMessage("No CGPA")
      .isFloat({ min: 0.0, max: 10.0 })
      .withMessage("Invalid CGPA")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }

    var cgpa = req.sanitize(req.body.cgpa);
    var projectID = mongoose.Types.ObjectId(req.sanitize(req.params.id));
    var experience = req.body.experience
      ? req.sanitize(req.body.experience)
      : "NA";
    var courseCode = req.sanitize(req.body.courseCode);
    var disc = req.sanitize(req.body.elective) == "disc" ? true : false;

    applicationsModel.find(
      { project: projectID, student: req.sanitize(req.user.email) },
      function(err, applications) {
        if (err) {
          console.log(err);
          return res.terminate("Could not validate application");
        }

        if (applications.length > 0) {
          return res.renderState("custom_errors", {
            redirect: "/dashboard/project-allotment-student",
            timeout: 3,
            supertitle: "Duplicate Application",
            message: "You have already applied for this project."
          });
        } else {
          projectsModel.findOne({ _id: projectID }, function(err, project) {
            if (err || !project) {
              console.log(err);
              return res.terminate("Could not find project");
            }
            applicationsModel.create(
              {
                project: projectID,
                student: req.sanitize(req.user.email),
                cgpa: cgpa,
                courseCode: courseCode,
                disciplinary: disc,
                experience: experience
              },
              function(err, application) {
                if (err) {
                  console.log(err);
                  return res.terminate("Could not create application");
                }
                mailer.send({
                  email: req.user.email,
                  subject: "Project Application",
                  body: `Hi ${
                    req.user.name
                  }, <br><p> Your application for the project <b>${
                    project.title
                  }</b> (Course Code <b>${
                    application.courseCode
                  }</b>) has been successfully submitted. The application ID is <b>${
                    application._id
                  }</b>. Please note this for future reference.</p><br>Thanks`
                });
                return res.renderState("custom_errors", {
                  redirect: "/dashboard/project-allotment-student",
                  timeout: 3,
                  supertitle: "Success",
                  message: "Your application has been submitted."
                });
              }
            );
          });
        }
      }
    );
  }
);

router.get("/manage/delete/:id", function(req, res, next) {
  applicationsModel.remove(
    {
      _id: req.sanitize(req.params.id),
      status: "P",
      student: req.sanitize(req.user.email)
    },
    function(err) {
      if (err) {
        console.log(err);
        return res.terminate("Could not delete application");
      }
      mailer.send({
        email: req.user.email,
        subject: "Project Application Deletion",
        body: `Hi ${
          req.user.name
        }, <br><p>You project application with ID <b>${req.sanitize(
          req.params.id
        )}</b> has been deleted</p>Thanks`
      });
      return res.redirect("/dashboard/project-allotment-student/manage");
    }
  );
});

router.get("/manage", function(req, res, next) {
  applicationsModel.aggregate(
    [
      {
        $match: {
          student: req.sanitize(req.user.email)
        }
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectForeign"
        }
      },
      {
        $project: {
          status: 1,
          updated: 1,
          courseCode: 1,
          disciplinary: 1,
          title: "$projectForeign.title"
        }
      },
      {
        $unwind: "$title"
      }
    ],
    function(err, applications) {
      if (err) {
        console.log(err);
        return res.terminate("Could not find applications");
      }
      return res.renderState(
        "dashboard/portals/project-allotment-student/manage",
        {
          applications: applications
        }
      );
    }
  );
});

router.get("/blank", function(req, res, next) {
  adminsModel.distinct("department", function(err, departments) {
    if (err) {
      console.log(err);
      return res.terminate("Could not find departments");
    }
    departments = departments.filter(function(department) {
      if (department) return department;
    });
    return res.renderState(
      "dashboard/portals/project-allotment-student/blank-step-1",
      {
        departments: departments
      }
    );
  });
});

router.post("/blank", function(req, res, next) {
  adminsModel.find(
    { department: req.sanitize(req.body.departments) },
    {},
    { sort: { email: 1 } },
    function(err, facultyList) {
      if (err) {
        console.log(err);
        return res.terminate("Could not find departments");
      }
      return res.renderState(
        "dashboard/portals/project-allotment-student/blank-step-2",
        {
          facultyList
        }
      );
    }
  );
});

router.post(
  "/blank/create",
  [
    check("title")
      .exists()
      .withMessage("No Project Title")
      .not()
      .isEmpty()
      .withMessage("No Project Title"),
    check("description")
      .exists()
      .withMessage("No Project Description")
      .not()
      .isEmpty()
      .withMessage("No Project Description")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }
    let data = {
      title: req.sanitize(req.body.title),
      description: req.sanitize(req.body.description),
      instructor: req
        .sanitize(req.body.faculty)
        .split("|")[0]
        .trim(),
      visible: false
    };
    const typeproj = req.sanitize(req.body.projectType);
    if (typeproj == "Lab Project (LP)") {
      data.type = "lop";
    } else if (typeproj == "Design Project (DP)") {
      data.type = "dop";
    } else {
      data.type = "sop";
    }
    projectsModel.create(data, (err, result) => {
      if (err) {
        return res.terminate(err);
      }
      return res.redirect(
        `/dashboard/project-allotment-student/view/${result._id}`
      );
    });
  }
);
router.get("/", function(req, res, next) {
  settingsModel.find({ name: "Project-Allotment-Guidelines" }, function(
    err,
    docs
  ) {
    if (docs[0])
      return res.renderState("dashboard/portals/project-allotment-student", {
        lines: docs[0].value
      });
    else if (err) return res.terminate(err);
    else return res.renderState("dashboard/portals/project-allotment-student");
  });
});

module.exports = router;
