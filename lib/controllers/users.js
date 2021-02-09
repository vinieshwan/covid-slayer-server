'use strict';

const Scrypt = require('scrypt-kdf');
const {
	NotFoundError,
	UnresolvedError,
	BadRequestError,
	UnAuthorizedError
} = require('../utils/errors');

/** Controller for users management */
class UsersController {
	constructor(config) {
		if (config.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (config.models.users === undefined) {
			throw new Error('Users model was not provided');
		}

		if (config.keys === undefined) {
			throw new Error('Keys were not provided');
		}

		this.model = config.models.users;
		this.keys = config.keys;
	}

	/**
	 * Add new user
	 * @param {object} user - User info
	 * @returns {Promise<string>} - User id
	 */
	async create(user) {
		const password = await Scrypt.kdf(user.password, {
			logN: this.keys.salt
		});

		user.password = password.toString('base64');

		const result = await this.model.create(user);

		if (result.n === 0) {
			throw new UnresolvedError('user not created');
		}

		return result.ops[0]._id;
	}

	/**
	 * Get a user's game settings
	 * @param {string} userId - User Id
	 * @returns {Promise<object>} - User data
	 */
	async get(userId) {
		const user = await this.model.get({
			userId: userId,
			fields: {
				email: 1,
				name: 1,
				avatar: 1
			}
		});

		if (user === null) {
			throw new NotFoundError('user');
		}

		return user;
	}

	/**
	 * Validate user login
	 * @param {string} userId - User Id
	 * @returns {Promise<object>} - User data
	 */
	async validate(email, password) {
		const user = await this.model.get({
			email,
			fields: {
				email: 1,
				password: 1,
				name: 1,
				avatar: 1
			}
		});

		if (user === null) {
			throw new BadRequestError('email');
		}

		const isMatched = await Scrypt.verify(
			Buffer.from(user.password, 'base64'),
			password
		);

		if (!isMatched) {
			throw new UnAuthorizedError('password');
		}

		return {
			name: user.name,
			userId: user._id,
			avatar: user.avatar
		};
	}

	/**
	 * Update a user
	 * @param {string} userId - User Id
	 * @param {object} [userInfo={}] - User info
	 * @param {string} [userInfo.email] - Email
	 * @param {string} [userInfo.name] - Name
	 * @returns {Promise<object>} - Updated user info
	 */
	async update(userId, userInfo) {
		userInfo.fields = {
			email: 1,
			name: 1,
			avatar: 1
		};

		const result = await this.model.update(userId, userInfo);

		if (result.value === null) {
			throw new NotFoundError('user');
		}

		return result.value;
	}
}

module.exports = UsersController;
