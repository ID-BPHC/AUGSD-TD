let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let ttExceptionsModel = fq("schemas/ttExceptions");

router.post("/add", function(req, res, next) {
  ttExceptionsModel.create(
    {
      date: req.sanitize(req.body.date),
      exception: parseInt(req.sanitize(req.body.exception))
    },
    function(err, result) {
      if (err) {
        return res.terminate(err);
      }
      return res.redirect("/admin/control/tt-exceptions");
    }
  );
});

router.get("/delete/:id", function(req, res, next) {
  ttExceptionsModel.remove({ _id: req.sanitize(req.params.id) }, function(err) {
    if (err) {
      return res.terminate(err);
    }
    return res.redirect("/admin/control/tt-exceptions");
  });
});

router.get("/", function(req, res, next) {
  ttExceptionsModel.find({}, function(err, ttExceptions) {
    if (err) {
      return res.terminate(err);
    }
    return res.renderState("admin/portals/control/ttExceptions", {
      ttExceptions
    });
  });
});

module.exports = router;
