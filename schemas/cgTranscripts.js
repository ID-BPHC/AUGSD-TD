var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var cgTranscriptSchema = new Schema({
  bitsId: String,
  date: {
    type: Date,
    default: Date.now()
  },
  status: String,
  email: String,
  info: {
    type: String,
    default: "No information provided."
  },
  applicationType: {
    type: Array,
  },
  active: {
    type: Boolean,
    default: true,
  }
});

var model = mongoose.model("cgtranscripts", cgTranscriptSchema);

module.exports = model;
