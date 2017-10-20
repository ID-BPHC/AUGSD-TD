var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	name: String,
	email: String,
	idNumber: String,
	courses: [{
		id: String,
		section: String
	}]
});

var model = mongoose.model('students', studentSchema);

module.exports = model;
