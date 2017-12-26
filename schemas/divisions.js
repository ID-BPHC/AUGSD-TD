var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var divisionsSchema = new Schema({
    name: String,
    email: String
});

var model = mongoose.model('divisions', divisionsSchema);

module.exports = model;