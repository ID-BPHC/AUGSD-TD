var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbacksSchema = new Schema({
    courseID: String,
    section: String,
    instructor: String, // Instructor's email
    type: String, // 24x7 or midsem
    responses: [String],
    createdOn: String
});

var model = mongoose.model('feedbacks-midsem', feedbacksSchema);

module.exports = model;