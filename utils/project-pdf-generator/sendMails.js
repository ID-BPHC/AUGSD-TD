const fq = require("fuzzquire");
const mailer = fq("utils/mailer");
const fs = require("fs");

["./IC-PDF/", "./Instructor-PDF/"].forEach(function(dir, index) {
  fs.readdir(dir, function(err, files) {
    if (err) {
      console.log(err);
      return;
    }

    files.forEach(function(filename, index) {
      if (filename.indexOf(".pdf") >= 0) {
        console.log(dir, "Sending to ", filename.replace(/.pdf+$/, ""));
        try {
          mailer.send({
            email: filename.replace(/.pdf+$/, ""),
            subject: "Project Allotment",
            body: "Test",
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
