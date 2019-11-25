let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");
let config = require("./config");
let morgan = require("morgan");
let cookieParser = require("cookie-parser");
let expressSanitizer = require("express-sanitizer");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let bugsModel = require("./schemas/bugs");
let app = express();

let admin = require("./routes/admin");
let dashboard = require("./routes/dashboard");
let index = require("./routes");

// view engine setup
app.set("views", path.join(__dirname, "views", config.siteMode));
app.set("view engine", "jade");
app.set("trust proxy", true);

//Favicon
app.use(
  favicon(
    path.join(__dirname, "public", config.siteMode, "images", "favicon.png")
  )
);

morgan.token("user", function(req) {
  if (typeof req.user !== "undefined") return req.user.email;
  else return "";
});

app.use(
  morgan(":date[clf] :user :remote-addr :user-agent - :method :status :url", {
    skip: function(req, res) {
      return (
        req.url.indexOf("/scripts") >= 0 ||
        req.url.indexOf("/stylesheets") >= 0 ||
        req.url.indexOf("/images") >= 0
      );
    }
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(expressSanitizer());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public", config.siteMode)));

mongoose.connect(
  config.mongooseConnection,
  {}
);

// A termination function on any kind of error that occours after login
app.use(function(req, res, next) {
  res.terminate = function(err) {
    bugsModel.create(
      {
        category: "Site",
        error: err,
        student: req.user.email,
        useragent: req.sanitize(req.headers["user-agent"])
      },
      function(err1, bug) {
        if (err1) {
          console.log(err1);
          res.end();
        }
        res.render("custom_errors", {
          redirect: "/",
          timeout: 5,
          supertitle: "Critical Breakdown.",
          message: "Server Error",
          details:
            "An unexpected error occoured. Software team has been notified about this. Contact Timetable Division for further assistance."
        });
      }
    );
  };
  next();
});

app.use("/admin", admin);
app.use("/dashboard", dashboard);
app.use("/", index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.locals.development = req.app.get("env") === "development";
  res.locals.missing = false;
  res.locals.title = "Oh noes";
  res.locals.subtitle = "Our guys have been notified about this.";
  if (err.status == 404) {
    res.locals.missing = true;
    res.locals.title = "404 Couldn't find it";
    res.locals.subtitle = "You sure you typed the link correctly?";
  }

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
