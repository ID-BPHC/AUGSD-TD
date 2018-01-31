var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectApplicationsSchema = new Schema({
    projectID: String,
    student: String, //Email
    cgpa: Number,
    courseCode: String,
    approved: {
        type: Boolean,
        default: false
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

var model = mongoose.model('projectApplications', projectsSchema);

module.exports = model;