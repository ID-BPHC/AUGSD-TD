var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var mongoose = require("mongoose");

var projectsModel = fq("schemas/projects");
var applicationsModel = fq("schemas/project-applications");

router.get("/", function(req, res, next) {
  applicationsModel.aggregate(
    [
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "email",
          as: "studentForeign"
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
          projectID: "$projectForeign._id",
          studentName: "$studentForeign.name",
          studentID: "$studentForeign.idNumber",
          instructor: "$projectForeign.instructor",
          title: "$projectForeign.title",
          student: 1,
          cgpa: 1,
          experience: 1,
          status: 1
        }
      },
      {
        $unwind: "$studentName"
      },
      {
        $unwind: "$instructor"
      },
      {
        $unwind: "$title"
      },
      {
        $unwind: "$studentID"
      },
      {
        $match: {
          instructor: req.sanitize(req.user.email)
        }
      }
    ],
    function(err, applications) {
      if (err) {
        console.log(err);
        return res.terminate(err);
      }

      return res.renderState("admin/portals/project-applications", {
        applications: applications
      });
    }
  );
});

let checkCount = function(req, res, next) {
  var action = req.sanitize(req.params.action);
  if (action === "approve") {
    applicationsModel.aggregate(
      [
        {
          $lookup: {
            from: "projects",
            localField: "project",
            foreignField: "_id",
            as: "projectForeign"
          }
        },
        {
          $match: {
            "projectForeign.instructor": req.user.email,
            status: "A"
          }
        }
      ],
      function(err, applications) {
        if (err) return res.terminate("Could not check existing approvals");
        if (applications.length < req.user.maxProjects) return next();
        else
          return res.renderState("custom_errors", {
            redirect: "/admin/project-applications",
            timeout: 3,
            supertitle: "Approval Limit Exceeded",
            callback: "/",
            message: `You have already approved ${
              req.user.maxProjects
            } projects`,
            details:
              "Reject some other application if you want to approve this one."
          });
      }
    );
  } else {
    next();
  }
};

router.get("/:action/:aid/project/:pid", checkCount, function(req, res, next) {
  var applicationID = req.sanitize(req.params.aid);
  var projectID = req.sanitize(req.params.pid);
  var action = req.sanitize(req.params.action);

  var actionHash = {
    approve: "A",
    reject: "R",
    undo: "P"
  };

  projectsModel.find(
    { _id: projectID, instructor: req.sanitize(req.user.email) },
    function(err, projects) {
      if (err) {
        console.log(err);
        return res.terminate("Could Not Find Project");
      }
      if (projects.length == 0) {
        return res.status(403).end();
      } else {
        applicationsModel.update(
          { _id: applicationID, project: projectID },
          { $set: { status: actionHash[action] } },
          function(err, num) {
            if (err) {
              console.log(err);
              return res.terminate("Could Not Modify Application");
            }
            return res.redirect("/admin/project-applications");
          }
        );
      }
    }
  );
});

module.exports = router;
