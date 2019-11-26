let express = require("express");
let router = express.Router();
let Holiday = require("../../../../common/room-booking/classes/Holiday");

const { check, validationResult } = require("express-validator/check");

router.get("/delete/:id", async (req, res, next) => {
  await Holiday.deleteById(req.params.id);
  return res.redirect("/admin/control/holidays");
});

router.post(
  "/add",
  [
    check("date")
      .exists()
      .withMessage("No Date")
      .not()
      .isEmpty()
      .withMessage("No Date Specified")
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", { errors: errors.mapped() });
    }
    let splitted = req.body.date.split("-");
    let year = parseInt(splitted[0]);
    let month = parseInt(splitted[1]);
    let day = parseInt(splitted[2]);
    await Holiday.addHoliday(day, month, year, req.body.description);
    return res.redirect("/admin/control/holidays");
  }
);

router.get("/", async (req, res, next) => {
  let holidays = await Holiday.getHolidays();
  return res.renderState("admin/portals/control/holidays", { holidays });
});

module.exports = router;
