var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectsSchema = new Schema({
    title: String,
    description: String,
    instructor: {
        type: String
    },
    name: {
        type: String
    },
    updated: {
        type: Date,
        default: Date.now
    },
    type: String
});

var model = mongoose.model('projects', projectsSchema);

module.exports = model;
