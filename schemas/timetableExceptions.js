let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ttExceptionsSchema = new Schema({
  day: Number,
  month: Number,
  year: Number,
  exception: Number
});

let model = mongoose.model("timetableExceptions", ttExceptionsSchema);

module.exports = model;
