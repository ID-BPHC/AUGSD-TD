const fq = require("fuzzquire");
const mailer = fq("utils/mailer");
const async = require("async");
const fs = require("fs");

let dirs = ["./IC-PDF/", "./Instructor-PDF/"];

async.eachSeries(dirs, (dir, nextDir) => {
  fs.readdir(dir, function(err, files) {
    if (err) {
      console.log(err);
      return;
    }

    var subject =
      dir == "./IC-PDF/"
        ? "Project Allotment (IC) - Second Semester 2018-19"
        : "Project Allotment (Instructor) - Second Semester 2018-19";
    var body =
      "Greetings, <br><br>Please find the attached the said document. ";
    async.eachSeries(
      files,
      (filename, next) => {
        if (filename.indexOf(".pdf") >= 0) {
          console.log(dir, "Sending to ", filename.replace(/.pdf+$/, ""));
          try {
            mailer.send({
              email: filename.replace(/.pdf+$/, ""),
              subject: subject,
              body: body,
              attachments: [
                {
                  filename: filename,
                  path: dir + filename
                }
              ]
            });
          } catch (e) {
            console.log(dir, "FAILED", filename.replace(/.pdf+$/, ""));
          }
        }
        setTimeout(next, 2500);
      },
      () => {
        nextDir();
      }
    );
  });
});
