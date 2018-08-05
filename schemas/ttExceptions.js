var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ttExceptionsSchema = new Schema({
  date: String,
  exception: Number
});

var model = mongoose.model("ttExceptions", ttExceptionsSchema);

module.exports = model;
