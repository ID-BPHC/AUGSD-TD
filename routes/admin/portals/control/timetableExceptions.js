let express = require("express");
let router = express.Router();
let TimetableException = require("../../../../common/room-booking/classes/TimetableException");

router.post("/add", async (req, res, next) => {
  let splitted = req.body.date.split("-");
  let year = parseInt(splitted[0]);
  let month = parseInt(splitted[1]);
  let day = parseInt(splitted[2]);
  let weekDay = parseInt(req.body.weekDay);
  await TimetableException.addException(day, month, year, weekDay);
  return res.redirect("/admin/control/timetable-exceptions");
});

router.get("/delete/:id", async (req, res, next) => {
  await TimetableException.deleteById(req.params.id);
  return res.redirect("/admin/control/timetable-exceptions");
});

router.get("/", async (req, res, next) => {
  let exceptions = await TimetableException.getExceptions();
  return res.renderState("admin/portals/control/timetableExceptions", {
    exceptions
  });
});

module.exports = router;
