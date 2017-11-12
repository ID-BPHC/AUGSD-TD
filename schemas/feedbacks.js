var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbacksSchema = new Schema({
	courseID: String,
	section: String,
	instructor: String, // Instructor's email
	type: String, // 24x7 or midsem
	responses: String,
	student: String
});

var model = mongoose.model('feedbacks', feedbacksSchema);

module.exports = model;
