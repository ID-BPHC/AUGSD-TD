var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminsSchema = new Schema({
	name: String,
	email: String,
	portals: [String],
	home: String,
	superUser: Boolean,
	courses: [{
		courseID: String,
		sections: [String]
	}]
});

var model = mongoose.model('admins', adminsSchema);

module.exports = model;
