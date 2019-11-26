let holidaysModel = require("../../../schemas/holidays");

class Holiday {
  static async getHolidays() {
    let holidays = await holidaysModel.find({}).sort("year month day");
    let formattedHolidays = [];
    holidays.forEach(holiday => {
      formattedHolidays.push({
        id: holiday._id,
        date: `${holiday.day}-${holiday.month}-${holiday.year}`,
        description: holiday.description
      });
    });
    return formattedHolidays;
  }
  static async deleteById(id) {
    await holidaysModel.deleteOne({ _id: id });
  }
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
