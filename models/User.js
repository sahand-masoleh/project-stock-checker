const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	ip: {
		type: String,
		required: true,
	},
	likes: {
		type: Array,
		default: [],
	},
});

module.exports = mongoose.model("User", userSchema);
