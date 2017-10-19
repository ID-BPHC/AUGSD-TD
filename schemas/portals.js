var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portalsSchema = new Schema({
	name: String,
	active: Boolean,
	admin: Boolean
});

var model = mongoose.model('portals', portalsSchema);

module.exports = model;
