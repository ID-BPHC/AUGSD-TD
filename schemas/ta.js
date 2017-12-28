var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taSchema = new Schema({
    student: String,
    type: String, // C or D,
    cgpa: {
        type: Number,
        default: 0
    },   
    hours: {
        type: Number,
        default: 0
    }, 
    idApproval: {
        type: String,
        default: "P"
    }, // P or A or R
    icApproval: {
        type: String,
        default: "P"
    }, // P or A or R
    icRemarks: {
        type: String,
        default: "None"
    }, // instructor remarks
    hdStudents: {
        type: Number,
        default: 0
    },

    // For course
    course: {
        type: String,
        default: "None"
    },
    registeredStudents: {
        type: Number,
        default: 0
    },
    numInstructors: {
        type: Number,
        default: 0
    },
    hodApproval: {
        type: String,
        default: "P"
    }, // P or A or R,,

    // For Division
    division: {
        type: String,
        default: "Nil"
    }
});

var model = mongoose.model('ta', taSchema);

module.exports = model;