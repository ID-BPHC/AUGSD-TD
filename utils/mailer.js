const nodemailer = require("nodemailer");
var appRootDir = require("app-root-dir").get();
const config = require("../config");

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: config.mailPort,
  secure: config.mailSecure,
  auth: {
    type: "OAuth2",
    user: config.mailUser,
    clientId: config.googleClientID,
    clientSecret: config.googleClientSecret,
    refreshToken: config.mailRefreshToken,
    tls: {
      rejectUnauthorized: false
    }
  }
});

let from =
  config.siteMode === "AUGSD"
    ? "Associate Dean, AUGSD"
    : "Faculty in-charge, Timetable Division";

var header =
  '<img src="cid:head@idbitshyd.com" width="100%"><br><br><br><font size="4">';
var footer = `<br><br><br><font color="#000000">This is an auto-generated mail. Please do not reply.</font><br><font color="#000000"><strong><font color="#f1c232">+++++++++++++</font><font color="#6fa8dc">++++++++++++</font><font color="#ff0000">+++++<wbr>+++++++</font></strong></font><br><font color="#0000ff"><br></font><font color="#0000ff">${from}<br>BITS Pilani - Hyderabad Campus</font></font></font><br>`;

module.exports = {
  send: function(params) {
    if (typeof params.attachments !== "undefined") {
      params.attachments.push({
        filename: "head.png",
        path: appRootDir + "/utils/assets/head.png",
        cid: "head@idbitshyd.com"
      });
    } else {
      params.attachments = [
        {
          filename: "head.png",
          path: appRootDir + "/utils/assets/head.png",
          cid: "head@idbitshyd.com"
        }
      ];
    }

    var mailOptions = {
      from: config.mailUser,
      to: params.email,
      subject: params.subject,
      html: header + params.body + footer,

      attachments: params.attachments
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.log("*****Error******");
        console.log(err);
        return false;
      } else {
        return true;
      }
    });
  }
};
