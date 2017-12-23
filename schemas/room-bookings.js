var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
    number: String,
    start: Date,
    end: Date,
    bookedBy: String,
    purpose: String,
    phone: String,
    av: Boolean,
    approval: String // P - Pending, A - Accepted, R - Rejected
});

var model = mongoose.model('room-bookings', bookingSchema);

module.exports = model;