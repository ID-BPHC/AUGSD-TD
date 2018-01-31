var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectsSchema = new Schema({
    title: String,
    description: String,
    instructor: String, // Instructor's email
    department: String, // Which Department
    updated: {
        type: Date,
        default: Date.now
    }
});

var model = mongoose.model('projects', projectsSchema);

module.exports = model;