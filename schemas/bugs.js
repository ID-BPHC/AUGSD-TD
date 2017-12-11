var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bugsSchema = new Schema({
    category: String,
    report: String,
    useragent: String,
    student: String
});

var model = mongoose.model('bugs', bugsSchema);

module.exports = model;