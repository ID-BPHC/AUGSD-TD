var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var projectHeadsSchema = new Schema({
  instructor: String, // Instructor's email
  department: {
    type: String
  },
  head: {
    type: Boolean
  },
  name: String
});

var model = mongoose.model("projectheads", projectHeadsSchema);

module.exports = model;
