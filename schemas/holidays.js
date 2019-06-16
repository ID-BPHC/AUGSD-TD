var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var holidaysSchema = new Schema({
  date: String,
  description: String
});

var model = mongoose.model("holidays", holidaysSchema);

module.exports = model;
