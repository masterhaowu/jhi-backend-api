const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const User = require('users/user.model');
const Role = require('_helpers/role');

// users hardcoded for simplicity, store in a db for production applications
const users = [{
		id: 1,
		username: 'admin',
		password: 'admin',
		firstName: 'Admin',
		lastName: 'User',
		role: Role.Admin
	},
	{
		id: 2,
		username: 'user',
		password: 'user',
		firstName: 'Normal',
		lastName: 'User',
		role: Role.User
	}
];

module.exports = {
	register,
	authenticate,
	getAll,
	getById
};

async function register({
	email,
	password
}) {
	let promise = new Promise(function(resolve, reject) {
		User.findOne({
			'email': email
		}, function(err, user) {
			if (err)
				reject();

			// check to see if theres already a user with that email
			if (user) {
				return resolve();
			}

			var newUser = new User();

			// set the user's local credentials
			newUser.email = email;
			newUser.password = generateHash(password);
			newUser.role = Role.User;

			// save the user
			newUser.save(function(err) {
				if (err)
					throw err;

				const token = jwt.sign({
					sub: newUser._id,
					role: newUser.role
				}, config.secret);

				resolve(newUser);
			});
		});
	});
	return promise;

}

async function authenticate({
	username,
	password
}) {
	const user = users.find(u => u.username === username && u.password === password);
	if (user) {
		const token = jwt.sign({
			sub: user.id,
			role: user.role
		}, config.secret);
		const {
			password,
			...userWithoutPassword
		} = user;
		return {
			...userWithoutPassword,
			token
		};
	}
}

async function getAll() {
	return users.map(u => {
		const {
			password,
			...userWithoutPassword
		} = u;
		return userWithoutPassword;
	});
}

async function getById(id) {
	const user = users.find(u => u.id === parseInt(id));
	if (!user) return;
	const {
		password,
		...userWithoutPassword
	} = user;
	return userWithoutPassword;
}

function generateHash(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};