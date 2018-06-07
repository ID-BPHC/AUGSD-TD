var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");

var courseData = require("./courseData");
var applicationsModel = fq("schemas/project-applications");
var projectsModel = fq("schemas/projects");
var headsModel = fq("schemas/project-heads");

router.get("/", (req, res, next) => {
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
          title: "$projectForeign.title",
          courseCode: 1,
          disciplinary: 1
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
      return res.renderState("dashboard/portals/project-update", {
        applications: applications
      });
    }
  );
});

router.get("/view/:id", (req, res, next) => {
  applicationsModel.findOne(
    { _id: req.sanitize(req.params.id), student: req.sanitize(req.user.email) },
    function(err, application) {
      if (!application || err) {
        console.log(err);
        return res.terminate("Could not find application");
      }

      projectsModel.findOne({ _id: application.project }, function(
        err,
        project
      ) {
        if (err) {
          console.log(err);
          return res.terminate("Could not find project");
        }

        headsModel.findOne({ instructor: project.instructor }, function(
          err,
          head
        ) {
          if (err) {
            console.log(err);
            return res.terminate("Could not find head");
          }

          return res.renderState("dashboard/portals/project-update/update", {
            project: project,
            application: application,
            head: head,
            courses: courseData[head.department][project.type]
          });
        });
      });
    }
  );
});

router.post("/update/:id", (req, res, next) => {
  var courseCode = req.sanitize(req.body.courseCode);
  var disc = req.sanitize(req.body.elective) == "disc" ? true : false;

  applicationsModel.update(
    { _id: req.sanitize(req.params.id), student: req.sanitize(req.user.email) },
    { $set: { courseCode: courseCode, disciplinary: disc } },
    function(err, num) {
      if (err) {
        console.log(err);
        return res.terminate("Could not update application");
      }

      return res.redirect("/dashboard/project-update");
    }
  );
});

module.exports = router;
