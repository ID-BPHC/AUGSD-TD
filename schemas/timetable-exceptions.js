let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ttExceptionsSchema = new Schema({
  day: Number,
  month: Number,
  year: Number,
  weekDay: Number
});

let model = mongoose.model("timetable-exceptions", ttExceptionsSchema);

module.exports = model;
