var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cgTranscriptUsersSchema = new Schema({
    email: String,
    bitsId: String,
    address: String,
    mcode: Number,
    name: String,
});

var model = mongoose.model("cgTranscriptUser", cgTranscriptUsersSchema);

module.exports = model;
