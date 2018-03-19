var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectHeadsSchema = new Schema({
    instructor: String, // Instructor's email
    department: {
        type: String
        //enum: ['Mathematics', 'Computer', 'Chemistry', 'Chemical', 'Civil', 'Economics', 'Physics', 'Biology', 'Pharmacy', 'Electronics', 'Manufacturing', 'Mechanical'],
    },
    head: {
        type: Boolean
    },
    name: String
});

var model = mongoose.model('projectHeads', projectHeadsSchema);

module.exports = model;