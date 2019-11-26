let exceptionsModel = require("../../../schemas/timetableExceptions");

class TimetableException {
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
