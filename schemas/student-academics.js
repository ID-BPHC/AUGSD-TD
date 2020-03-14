var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var studentAcademicsSchema = new Schema({
    erpId: {
        type: String,
    },
    idNo: {
        type: String,
    },
    studentName: String, 
    discipline: String,
    bitsatScore: Number,
    semesters: [String],
    cgs: [Number],
    raEmail: String
}, {strict: false});

var model = mongoose.model("student-academics", studentAcademicsSchema);

module.exports = model;