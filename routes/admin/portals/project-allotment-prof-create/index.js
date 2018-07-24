var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");
var projectsModel = fq("schemas/projects");
const { check, validationResult } = require("express-validator/check");

router.get("/", function(req, res, next) {
  let aggregatePipeline = [];
  if (!req.user.superUser) {
    aggregatePipeline.push({
      $match: {
        instructor: req.sanitize(req.user.email)
      }
    });
  }
  aggregatePipeline.push(
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
        instructorName: "$instructorForeign.name",
        title: 1,
        type: 1
      }
    },
    {
      $unwind: "$instructorName"
    }
  );
  projectsModel.aggregate(aggregatePipeline, function(err, projects) {
    if (err) throw err;
    return res.renderState("admin/portals/project-allotment-prof-create", {
      projects: projects
    });
  });
});

router.get("/view/:id", function(req, res, next) {
  let findQuery = {
    _id: req.sanitize(req.params.id)
  };
  if (!req.user.superUser) findQuery.instructor = req.user.email;
  projectsModel.findOne(findQuery, (err, result) => {
    if (err) {
      return res.terminate(err);
    }
    res.renderState("admin/portals/project-allotment-prof-create/view", {
      project: result
    });
  });
});

router.post(
  "/create",
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
      instructor: req.user.email
    };
    const typeproj = req.sanitize(req.body.projectType);
    if (typeproj == "Lab Oriented Project (LOP)") {
      data.type = "lop";
    } else if (typeproj == "Design Oriented Project (DOP)") {
      data.type = "dop";
    } else {
      data.type = "sop";
    }
    projectsModel.create(data, (err, result) => {
      if (err) {
        return res.terminate(err);
      }
      return res.redirect("/admin/project-allotment-prof-create");
    });
  }
);

router.get("/create", function(req, res, next) {
  return res.renderState("admin/portals/project-allotment-prof-create/create");
});

router.get("/delete/:id", function(req, res, next) {
  let deleteQuery = {
    _id: req.sanitize(req.params.id)
  };
  if (!req.user.superUser) deleteQuery.instructor = req.user.email;
  projectsModel.findOneAndRemove(deleteQuery, (err, result) => {
    if (err) {
      return res.terminate(err);
    }
    return res.redirect("/admin/project-allotment-prof-create");
  });
});

module.exports = router;
