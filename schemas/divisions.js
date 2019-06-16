var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var divisionsSchema = new Schema({
  name: String,
  email: String,
  ic: {
    type: String,
    default: "sohailrajdev97@gmail.com"
  },
  dean: {
    type: String,
    default: "rajdevsohail007@gmail.com"
  }
});

var model = mongoose.model("divisions", divisionsSchema);

module.exports = model;
