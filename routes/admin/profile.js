var express = require("express");
var router = express.Router();

var coursesModel = require("../../schemas/courses");

let getCourseByInstructor = function(instructorEmailId) {
  return new Promise((resolve, reject) => {
    coursesModel.find(
      {
        "sections.instructors": { $in: [instructorEmailId] }
      },
      {},
      function(err, courses) {
        resolve(courses);
        reject("error in finding courses");
      }
    );
  });
};
router.get("/", (req, res) => {
  getCourseByInstructor(req.user.email)
    .then(courses => {
      res.renderState("admin/profile", {
        courses: courses
      });
    })
    .catch(err => {
      console.log("error is  : " + err);
    });
});

module.exports = router;
