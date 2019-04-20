var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bugsSchema = new Schema({
  category: String,
  report: String,
  useragent: String,
  user: String,
  error: {
    type: Object,
    default: null
  }
});

var model = mongoose.model("bugs", bugsSchema);

module.exports = model;
