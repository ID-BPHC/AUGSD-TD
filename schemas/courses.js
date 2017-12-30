var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coursesSchema = new Schema({
    courseID: String,
    name: String,
    ic: String, // Stores email id of the course's IC
    hod: String, // Email ID of the hod
    sections: [{
        section: String,
        instructors: [String] // This will store emails of intstructors for a particular section
    }]
});

var model = mongoose.model('courses', coursesSchema);

module.exports = model;