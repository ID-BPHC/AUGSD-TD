var express = require("express");
var router = express.Router();
var fq = require("fuzzquire");

const fs = require("fs");
const Json2csvParser = require("json2csv").Parser;

var projectsModel = fq("schemas/projects");
var applicationsModel = fq("schemas/project-applications");

router.get("/", function(req, res, next) {
  return res.renderState("admin/portals/project-list");
});

router.get("/export/:status", function(req, res, next) {
  var status = req.sanitize(req.params.status);

  applicationsModel.aggregate(
    [
      {
        $match: {
          status: status
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
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "email",
          as: "studentForeign"
        }
      },
      {
        $lookup: {
          from: "projectheads",
          localField: "projectForeign.instructor",
          foreignField: "instructor",
          as: "instructorForeign"
        }
      },
      {
        $project: {
          ID_Number: "$studentForeign.idNumber",
          Student_Name: "$studentForeign.name",
          Instructor: "$instructorForeign.name",
          Instructor_Email: "$instructorForeign.instructor",
          Project: "$projectForeign.title",
          Project_Type: "$projectForeign.type",
          Department: "$instructorForeign.department",
          courseCode: 1,
          disciplinary: 1,
          _id: 0
        }
      },
      {
        $unwind: "$Student_Name"
      },
      {
        $unwind: "$ID_Number"
      },
      {
        $unwind: "$Instructor"
      },
      {
        $unwind: "$Instructor_Email"
      },
      {
        $unwind: "$Project"
      },
      {
        $unwind: "$Project_Type"
      },
      {
        $unwind: "$Department"
      }
    ],
    function(err, list) {
      if (err) {
        console.log(err);
        return res.terminate("Could not load the list");
      }

<<<<<<< eb08b1933ecb4e4422cec86f96235fae149bbaed
      if (list.length == 0) {
        return res.renderState("custom_errors", {
          redirect: "/admin/project-list",
          timeout: 2,
          supertitle: "No Applications",
          callback: "/",
          message: "There are no applications in this category",
          details: "."
        });
      } else {
        const json2csvParser = new Json2csvParser();
        const csv = json2csvParser.parse(list);
=======
	applicationsModel.aggregate([{
		$match: {
			status: status
		}
	}, {
		$lookup: {
			from: 'projects',
			localField: 'project',
			foreignField: '_id',
			as: 'projectForeign'
		}
	}, {
		$lookup: {
			from: 'students',
			localField: 'student',
			foreignField: 'email',
			as: 'studentForeign'
		}
	}, {
		$lookup: {
			from: 'admins',
			localField: 'projectForeign.instructor',
			foreignField: 'email',
			as: 'instructorForeign'
		}
	}, {
		$project: {
			'ID_Number': '$studentForeign.idNumber',
			'Student_Name': '$studentForeign.name',
			'Instructor': '$instructorForeign.name',
			'Instructor_Email': '$instructorForeign.instructor',
			'Project': '$projectForeign.title',
			'Project_Type': '$projectForeign.type',
			'Department': '$instructorForeign.department',
			courseCode: 1,
			disciplinary: 1,
			_id: 0
		}
	}, {
		$unwind: '$Student_Name'
	}, {
		$unwind: '$ID_Number'
	}, {
		$unwind: '$Instructor'
	}, {
		$unwind: '$Instructor_Email'
	}, {
		$unwind: '$Project'
	}, {
		$unwind: '$Project_Type'
	}, {
		$unwind: '$Department'
	}], function (err, list) {
>>>>>>> refactor: Merged projectHead schema with admins

        var filenameHash = {
          P: "Pending.csv",
          A: "Approved.csv",
          R: "Rejected.csv"
        };
        res.attachment(filenameHash[status]);

        return res.status(200).send(csv);
      }
    }
  );
});

module.exports = router;
