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
    type: Array // ApplicationType can be one of several types of appliations that the end user can request, defined in the applicationTypes.js file.
  },
  active: {
    type: Boolean,
    default: true
  },
  paytmInfo: Array // Information required by the paytm checksum utility
});

var model = mongoose.model("cgtranscripts", cgTranscriptSchema);

module.exports = model;
