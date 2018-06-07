var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
  number: String,
  start: {
    type: Date,
    default: new Date()
  },
  end: {
    type: Date,
    default: new Date()
  },
  bookedBy: String,
  purpose: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  av: {
    type: Boolean,
    default: false
  },
  approval: {
    type: String,
    default: "P"
  }, // P - Pending, A - Accepted, R - Rejected
  blockAll: {
    type: Boolean,
    default: false
  }
});

var model = mongoose.model("room-bookings", bookingSchema);

module.exports = model;
