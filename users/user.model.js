const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var userSchema = new Schema({

	email: {
		type: String,
		unique: true
	},
	password: String,
	username: String,
	role: String

});

var User = mongoose.model('User', userSchema);

module.exports = User;