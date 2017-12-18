var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    number: String,
    type: String,
    lectureCapacity: Number,
    examCapacity: Number,
    fixedClasses: [
        [String]
    ]
});

var model = mongoose.model('rooms', roomSchema);

module.exports = model;