let holidaysModel = require("../../../schemas/holidays");

class Holiday {
  static addHoliday(day, month, year, description) {
    // Add holiday
    return holidaysModel.create({ day, month, year, description });
  }
  static async isHoliday(day, month, year) {
    // Check holiday
    let holiday = await holidaysModel.findOne({ day, month, year });
    return !!holiday;
  }
}

module.exports = Holiday;
