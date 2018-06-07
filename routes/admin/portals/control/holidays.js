var express = require("express");
var path = require("path");
var router = express.Router();
var fq = require("fuzzquire");
var holidaysModel = fq("schemas/holidays");

const { check, validationResult } = require("express-validator/check");

router.get("/delete/:id", function(req, res, next) {
  holidaysModel.remove({ _id: req.sanitize(req.params.id) }, function(err) {
    if (err) {
      return res.terminate(err);
    }
    return res.redirect("/admin/control/holidays");
  });
});

router.post(
  "/add",
  [
    check("date")
      .exists()
      .withMessage("No Date")
      .not()
      .isEmpty()
      .withMessage("No Date Specified"),
    check("description")
      .exists()
      .withMessage("No Description")
      .not()
      .isEmpty()
      .withMessage("No Description")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }

    holidaysModel.create(
      {
        date: req.sanitize(req.body.date),
        description: req.sanitize(req.body.description)
      },
      function(err, result) {
        if (err) {
          return res.terminate(err);
        }
        return res.redirect("/admin/control/holidays");
      }
    );
  }
);

router.get("/", function(req, res, next) {
  holidaysModel.find({}, function(err, holidays) {
    if (err) {
      return res.terminate(err);
    }
    res.renderState("admin/portals/control/holidays", { holidays: holidays });
  });
});

module.exports = router;
