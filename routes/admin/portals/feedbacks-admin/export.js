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
    var feeds = [];
    var link = req.originalUrl.split("/");
    var feedtype = link[4];

    feedbacksModel.find(
      {
        type: link[4]
      },
      (err, feedbacks) => {
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
            const parser = new Json2csvParser(opts);
            const csv = parser.parse(feedbacks);
            const fileName = feedtype + "Dump__" + Date.now() + ".csv";
            const relPath = path.join("./public/AUGSD/", fileName);
            const absPath = path.join(
              __dirname,
              "./../../../../public/AUGSD/",
              fileName
            );
            fs.writeFile(relPath, csv, err => {
              if (err) {
                console.log(err);
              }
              res.download(absPath, err => {
                if (err) {
                  console.log(err);
                }
                fs.unlink(relPath, err => {
                  if (err) {
                    console.log(err);
                  }
                });
              });
            });
          }
        );
      }
    );
  } catch (err) {
    return res.terminate(err);
  }
});

module.exports = router;
