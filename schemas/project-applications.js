var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectApplicationsSchema = new Schema({
    project: Schema.Types.ObjectId,
    student: String,
    cgpa: Number,
    experience: String,
    courseCode: String,
    approved: {
        type: String,
        default: "P"
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

var model = mongoose.model('project-applications', projectApplicationsSchema);

module.exports = model;
