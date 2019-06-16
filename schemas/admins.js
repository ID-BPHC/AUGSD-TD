var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var adminsSchema = new Schema({
  name: String, // Admin Name
  email: String,
  portals: [String],
  home: String,
  department: String, // Department Name
  departmentCode: String,
  maxProjects: Number,
  superUser: Boolean
});

var model = mongoose.model("admins", adminsSchema);

module.exports = model;
