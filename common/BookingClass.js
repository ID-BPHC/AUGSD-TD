let Moment = require("moment");
let MomentRange = require("moment-range");
let moment = MomentRange.extendMoment(Moment);

class Booking {
  constructor(
    email,
    dateString,
    startString,
    endString,
    dates,
    purpose,
    av,
    phone,
    isFaculty
  ) {
    this.email = email;
    this.dateString = dateString;
    this.startString = startString;
    this.endString = endString;
    this.dates = dates,
    this.purpose = purpose;
    this.av = av;
    this.phone = phone;
    this.isFaculty = isFaculty;

    this.startHour = parseInt(startString.substring(0, 2)) - 8;
    this.endHour = parseInt(endString.substring(0, 2)) - 8;
    this.startTimeObj = null;
    this.endTimeObj = null;

    try {
      this.startTimeObj = new moment(
        this.dateString + " " + this.startString,
        "ddd DD MMM YYYY HH:mm"
      ).utcOffset("+05:30");
      this.endTimeObj = new moment(
        this.dateString + " " + this.endString,
        "ddd DD MMM YYYY HH:mm"
      ).utcOffset("+05:30");
    } catch (e) {
      throw e;
    }
  }
}

module.exports = Booking;
