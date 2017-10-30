var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portalsSchema = new Schema({
	displayName: String,
	name: String,
	icon: String,
	active: Boolean,
	admin: Boolean
});

var model = mongoose.model('portals', portalsSchema);

module.exports = model;
