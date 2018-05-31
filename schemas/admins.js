var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var adminsSchema = new Schema({
<<<<<<< eb08b1933ecb4e4422cec86f96235fae149bbaed
  name: String,
  email: String,
  portals: [String],
  home: String,
  superUser: Boolean
=======
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
>>>>>>> refactor: Merged projectHead schema with admins
});

var model = mongoose.model("admins", adminsSchema);

module.exports = model;
<<<<<<< eb08b1933ecb4e4422cec86f96235fae149bbaed
=======


>>>>>>> refactor: Merged projectHead schema with admins
