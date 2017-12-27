var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taSchema = new Schema({
    student: String,
    type: String, // C or D,
    cgpa: Number,   
    hours: Number, 
    idApproval: String, // P or A or R
    icApproval: String, // P or A or R
    icRemarks: String, // instructor remarks
    hdStudents: Number,

    // For course
    course: String,
    registeredStudents: Number,
    numInstructors: Number,
    hodApproval: String, // P or A or R,,

    // For Division
    division: String
});

var model = mongoose.model('ta', taSchema);

module.exports = model;