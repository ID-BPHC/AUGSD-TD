var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cgTranscriptSchema = new Schema({
  bitsId: String,
  date: Date,
  applicationType: String,
  status: String,
  email: String,
  applicationType: String,
  active: {
    type: Boolean,
    default: true,
  }
});

var model = mongoose.model("cgtranscripts", cgTranscriptSchema);

module.exports = model;
