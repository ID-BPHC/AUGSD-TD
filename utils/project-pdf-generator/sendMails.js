const fq = require("fuzzquire");
const mailer = fq("utils/mailer");
const fs = require("fs");

["./IC-PDF/", "./Instructor-PDF/"].forEach(function(dir, index) {
  fs.readdir(dir, function(err, files) {
    if (err) {
      console.log(err);
      return;
    }

    var subject =
      dir == "./IC-PDF/"
        ? "Project Allotment (IC) - Student List"
        : "Project Allotment - Student List";
    var body =
      "Greetings, <br><br> Please find the attached list of project students under your guidance during First Semester 2018-19.";

    files.forEach(function(filename, index) {
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
    });
  });
});
