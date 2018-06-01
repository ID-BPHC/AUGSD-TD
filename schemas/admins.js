var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var adminsSchema = new Schema({
    name: String,
    email: String,
    portals: [String],
    home: String,
    superUser: Boolean,
    department: {
		type: String
    },
    head: {
		type: Boolean
	},
});

var model = mongoose.model("admins", adminsSchema);
module.exports = model;