var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var studentHistorySchema = new Schema({
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
    cgs: [Number]
}, {strict: false});

var model = mongoose.model("student-history", studentHistorySchema);

module.exports = model;