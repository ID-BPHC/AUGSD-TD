var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logsSchema = new Schema({
    eventType: String,
    logEvent: String,
    dateLogged: {type: Date, default: Date.now},
});

var model = mongoose.model('logs', logsSchema);

module.exports = model;