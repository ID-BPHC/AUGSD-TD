var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coursesSchema = new Schema({
	courseId: String,
	name: String,
	ic: String, // Stores email id of the course's IC
	sections: [{
		section: String,
		instructors: [String] // This will store emails of intstructors for a particular section
	}]
});

var model = mongoose.model('courses', coursesSchema);

module.exports = model;
