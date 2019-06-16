var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var inductionsSchema = new Schema({
  cgpa: String,
  hours: String,
  reason: String, // Instructor's email
  github: String, // 24x7 or midsem
  user: String,
  resumePath: String,
  nodejs: Boolean,
  originalName: String
});

var model = mongoose.model("inductions", inductionsSchema);

module.exports = model;
