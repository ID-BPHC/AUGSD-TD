var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settingsSchema = new Schema({
    name: String,
    description: String,
    value: [String]
});

var model = mongoose.model('settings', settingsSchema);

module.exports = model;