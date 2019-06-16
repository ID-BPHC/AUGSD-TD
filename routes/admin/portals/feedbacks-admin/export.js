const express = require("express");
const router = express.Router();
const fq = require("fuzzquire");
const fs = require("fs");
const Json2csvParser = require("json2csv").Parser;
const path = require("path");

const feedbacksModel = fq("schemas/feedbacks");
const adminsModel = fq("schemas/admins");

var fields = [];

router.get("/", (req, res, next) => {
  try {
    var link = req.originalUrl.split("/");
    var feedtype = link[4];

    adminsModel.find(
      {
        email: req.user.email
      },
      (err, profile) => {
        if (err) {
          return res.terminate(err);
        }
        superAdmin = profile[0].superUser;
        professor = profile[0].email;

        if (superAdmin) {
          var feedquery = {
            type: link[4]
          };
        } else {
          var feedquery = {
            instructor: professor,
            type: link[4]
          };
        }

        feedbacksModel.find(feedquery, (err, feedbacks) => {
          if (err) {
            return res.terminate(err);
          }

          adminsModel.find(
            {
              superUser: false
            },
            {
              __v: 1,
              name: 1,
              email: 1
            },
            (err, profs) => {
              if (err) {
                return res.terminate(err);
              }

              feedbacks.forEach((object, index, array) => {
                profs.forEach((obj, ind, arr) => {
                  if (arr[ind].email === array[index].instructor) {
                    array[index].InstructorName = arr[ind].name;
                  }
                });
              });

              if (feedtype == "24x7") {
                fields = [
                  "InstructorName",
                  "instructor",
                  "courseID",
                  "section",
                  {
                    label: "feedback",
                    value: "responses[0]"
                  }
                ];
              } else if (feedtype == "midsem") {
                fields = [
                  "InstructorName",
                  "instructor",
                  "courseID",
                  "section",
                  {
                    label: "Response 1",
                    value: "responses[0]"
                  },
                  {
                    label: "Response 2",
                    value: "responses[1]"
                  },
                  {
                    label: "Response 3",
                    value: "responses[2]"
                  }
                ];
              }

              const opts = { fields };
              var d = new Date();
              const parser = new Json2csvParser(opts);
              const csv = parser.parse(feedbacks);
              const fileName =
                feedtype +
                "-feedbacks-" +
                d.getFullYear() +
                "-" +
                (d.getMonth() + 1) +
                "-" +
                d.getDate() +
                ".csv";

              res.attachment(fileName);
              return res.status(200).send(csv);
            }
          );
        });
      }
    );
  } catch (err) {
    return res.terminate(err);
  }
});

module.exports = router;
