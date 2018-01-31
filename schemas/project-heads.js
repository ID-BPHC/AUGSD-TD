var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectHeadsSchema = new Schema({
    instructor: String, // Instructor's email
    department: ['Mathematics', 'Computer', 'Chemistry', 'Chemical', 'Civil', 'Economics', 'Physics', 'Biology', 'Pharmacy', 'Electronics', 'Manufacturing', 'Mechanical'],
    head: {
        type: Boolean,
        default: false
    }
});

var model = mongoose.model('projects', projectHeadsSchema);

module.exports = model;