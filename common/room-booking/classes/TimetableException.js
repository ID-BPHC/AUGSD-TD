let exceptionsModel = require("../../../schemas/timetable-exceptions");

let days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
class TimetableException {
  static async getExceptions() {
    let exceptions = await exceptionsModel.find({}).sort("year month day");
    let formattedExceptions = [];
    exceptions.forEach(exception => {
      formattedExceptions.push({
        id: exception._id,
        date: `${exception.day}-${exception.month}-${exception.year}`,
        weekDay: days[exception.weekDay]
      });
    });
    return formattedExceptions;
  }
  static async deleteById(id) {
    await exceptionsModel.deleteOne({ _id: id });
  }
  static addException(day, month, year, weekDay) {
    // Add TimetableException
    return exceptionsModel.create({ day, month, year, weekDay });
  }
  static async getException(day, month, year) {
    // Return exception day or null (incase of no exceptiom)
    let exception = await exceptionsModel.findOne({ day, month, year });
    return exception ? exception.weekDay : null;
  }
}

module.exports = TimetableException;
