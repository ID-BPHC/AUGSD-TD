var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cgTranscriptUsersSchema = new Schema({
  email: String,
  bitsId: String,
  address: String,
  mcode: Number,
  name: String,
  mob: String,
  sex: {
    type: String,
    enum: ["M", "F", "O"]
  }
});

var model = mongoose.model("cgTranscriptUser", cgTranscriptUsersSchema);

module.exports = model;
