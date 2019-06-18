var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var applicationTypeSchema = new Schema({
    name: String,
    desc: String,
    cost: Number,
    options: [String],
});

var model = mongoose.model("applicationTypes", applicationTypeSchema);

module.exports = model;
