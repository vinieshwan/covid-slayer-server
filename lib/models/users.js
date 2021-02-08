'use strict';

const { ObjectID } = require('mongodb');

/** Model for user management */
class UsersModel {
	constructor(client, options) {
		const db = client.db(options.database);

		this.collection = db.collection('users');
	}

	async createIndexes() {
		await this.collection.createIndex(
			{ email: 1 },
			{
				unique: true
			}
		);
	}

	/**
	 * Add new user
	 * @param {object} user - User info
	 * @returns {Promise<object>} - Db operation response
	 */
	create(user) {
		Object.assign(user, {
			createdOn: new Date(),
			updatedOn: new Date()
		});

		return this.collection.insertOne(user);
	}

	/**
	 * Get a user
	 * @param {object} [options={}] - Options
	 * @param {string} [options.userId] - User id
	 * @param {string} [options.email] - User email
	 * @param {object} [options.fields] - Fields to retrieve
	 * @returns {Promise<object>} - Db operation response
	 */
	get(options = {}) {
		const queryOptions = {};
		const query = {};

		if (options.fields !== undefined) {
			queryOptions.projection = options.fields;
		}

		if (options.userId !== undefined) {
			query._id = new ObjectID(options.userId);
		}

		if (options.email !== undefined) {
			query.email = options.email;
		}

		return this.collection.findOne(query, queryOptions);
	}

	/**
	 * Update a user
	 * @param {string} userId - User Id
	 * @param {object} userInfo - user info to update
	 * @returns {Promise<object>} - Db operation response
	 */
	update(userId, userInfo) {
		const options = {
			returnOriginal: false
		};

		if (userInfo.fields !== undefined) {
			options.projection = userInfo.fields;
		}

		return this.collection.findOneAndUpdate(
			{
				_id: new ObjectID(userId)
			},
			{
				$set: {
					...userInfo,
					updatedOn: new Date()
				}
			},
			options
		);
	}
}

module.exports = UsersModel;
