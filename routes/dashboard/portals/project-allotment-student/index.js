var express = require("express");
var router = express.Router();

var fq = require("fuzzquire");
var mongoose = require("mongoose");
var Promise = require("promise");
const { check, validationResult } = require("express-validator/check");
var path = require("path");

var projectsModel = fq("schemas/projects");
var headsModel = fq("schemas/project-heads");
var applicationsModel = fq("schemas/project-applications");

router.use(function(req, res, next) {
  if (req.user.email.indexOf("f2017") == 0) {
    return res.renderState("custom_errors", {
      redirect: "/dashboard",
      timeout: 2,
      supertitle: "Not Eligible",
      message: "2017 Batch is not eligible for project type courses",
      details: " "
    });
  } else {
    next();
  }
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
          from: "projectheads",
          localField: "instructor",
          foreignField: "instructor",
          as: "instructorForeign"
        }
      },
      {
        $project: {
          department: "$instructorForeign.department",
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
                generateForm: applications.length == 0 ? true : false
              }
            );
          }
        );
      }
    }
  );
});

router.get("/view", function(req, res, next) {
  headsModel.distinct("department", function(err, departments) {
    if (err) {
      console.log(err);
      return res.terminate("Could not find departments");
    }
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
          from: "projectheads",
          localField: "instructor",
          foreignField: "instructor",
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
          type: 1
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
          department: req.body.departments
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
          applicationsModel.create(
            {
              project: projectID,
              student: req.sanitize(req.user.email),
              cgpa: cgpa,
              experience: experience
            },
            function(err, result) {
              if (err) {
                console.log(err);
                return res.terminate("Could not create application");
              }

              return res.renderState("custom_errors", {
                redirect: "/dashboard/project-allotment-student",
                timeout: 3,
                supertitle: "Success",
                message: "Your application has been submitted."
              });
            }
          );
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

router.get("/", function(req, res, next) {
  return res.renderState("dashboard/portals/project-allotment-student");
});

module.exports = router;
