'use strict';

const { UnresolvedError, UnAuthorizedError } = require('../utils/errors');

/** Controller for sessions management */
class SessionsController {
	constructor(config) {
		if (config.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (config.models.sessions === undefined) {
			throw new Error('Sessions model was not provided');
		}

		if (config.expiries === undefined) {
			throw new Error('Expiries were not provided');
		}

		this.model = config.models.sessions;
		this.expiries = config.expiries;
	}

	/**
	 * Create new session
	 * @param {string} userId - User Id
	 * @returns {Promise<object>} - User session
	 */
	async create(userId) {
		const result = await this.model.create(
			userId,
			new Date(new Date().valueOf() + this.expiries.refreshToken)
		);

		if (result.n === 0) {
			throw new UnresolvedError('session created');
		}

		return {
			sessionId: result.ops[0]._id,
			expiry: result.ops[0].expiresOn
		};
	}

	/**
	 * Load user's session
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @returns {Promise<object>} - User session
	 */
	async load(userId, sessionId) {
		const session = await this.model.load(userId, sessionId, {
			fields: {
				expiresOn: 1,
				expired: 1
			}
		});

		if (session === null) {
			throw new UnresolvedError('session');
		}

		if (session.expired) {
			throw new UnAuthorizedError('user');
		}

		return {
			sessionId: session._id,
			expiry: session.expiresOn
		};
	}

	/**
	 * Refresh a session
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @returns {Promise<object>} - User session
	 */
	async refreshSession(userId, sessionId) {
		const result = await this.model.updateExpiry(
			userId,
			sessionId,
			new Date(new Date().valueOf() + this.expiries.refreshToken)
		);

		if (result.value === null) {
			throw new UnresolvedError('session');
		}

		if (result.expired) {
			throw new UnAuthorizedError('user');
		}

		return {
			sessionId: result.value._id,
			expiry: result.value.expiresOn
		};
	}

	/**
	 * Expire a session
	 * @param {string} userId - User Id
	 * @param {string} sessionId - Session Id
	 * @returns {Promise<object>} - User data
	 */
	async expireSession(userId, sessionId) {
		const result = await this.model.expire(userId, sessionId);

		if (result.value === null) {
			throw new UnresolvedError('session');
		}

		return true;
	}
}

module.exports = SessionsController;
