'use strict';

const { ObjectID } = require('mongodb');

/** Model for session management */
class SessionsModel {
	constructor(client, options) {
		const db = client.db(options.database);

		this.collection = db.collection('sessions');
	}

	async createIndexes() {
		await this.collection.createIndex({ userId: 1, ip: 1 });
	}

	/**
	 * Create session for a user
	 * @param {string} userId - User id
	 * @param {Date} expiry - Expiry date
	 * @returns {Promise<object>} - Db operation response
	 */
	create(userId, expiry) {
		return this.collection.insertOne({
			userId: new ObjectID(userId),
			expiresOn: expiry,
			createdOn: new Date(),
			updatedOn: new Date(),
			expired: false
		});
	}

	/**
	 * Get a user's session
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @param {object} [options={}] - Options
	 * @param {object} [options.fields] - Fields to retrieve
	 * @returns {Promise<object>} - Db operation response
	 */
	load(userId, sessionId, options = {}) {
		const queryOptions = {};

		if (options.fields !== undefined) {
			queryOptions.projection = options.fields;
		}

		return this.collection.findOne(
			{
				_id: new ObjectID(sessionId),
				userId: new ObjectID(userId),
				expired: false
			},
			queryOptions
		);
	}

	/**
	 * Update session expiry
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @param {Date} expiry - Expiry date
	 * @returns {Promise<object>} - Db operation response
	 */
	updateExpiry(userId, sessionId, expiry) {
		return this.collection.findOneAndUpdate(
			{
				_id: new ObjectID(sessionId),
				userId: new ObjectID(userId),
				expired: false
			},
			{
				$set: {
					expiresOn: expiry,
					updatedOn: new Date()
				}
			},
			{
				returnOriginal: false
			}
		);
	}

	/**
	 * Expire user session
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @returns {Promise<object>} - Db operation response
	 */
	expire(userId, sessionId) {
		return this.collection.findOneAndUpdate(
			{
				_id: new ObjectID(sessionId),
				userId: new ObjectID(userId),
				expired: false
			},
			{
				$set: {
					expired: true,
					updatedOn: new Date()
				}
			},
			{
				returnOriginal: false
			}
		);
	}
}

module.exports = SessionsModel;
