'use strict';

const {
	NotFoundError,
	ConflictError,
	UnresolvedError,
	BadRequestError,
	UnAuthorizedError
} = require('./errors');

const randToken = require('rand-token');
const jwt = require('jsonwebtoken');

/**
 * Route response formatter
 * @param {object} res
 * @param {object} [options={}] - Options
 * @param {number} [options.statusCode] - Status code
 * @param {string} [options.message] - Message
 * @param {object} [options.data] - Data object
 * @param {object} [options.error] - Error object
 * @returns {object} - Formatted response
 */
exports.response = (res, options = {}) => {
	let code = options.statusCode || 200;
	let message = options.message || '';
	let data = options.data || {};

	if (options.error !== undefined) {
		message = options.error.message || '';

		if (options.error instanceof NotFoundError) {
			code = 404;
		} else if (options.error instanceof ConflictError) {
			code = 409;
		} else if (options.error instanceof UnAuthorizedError) {
			code = 401;
		} else if (options.error instanceof BadRequestError) {
			code = 400;
		} else if (options.error instanceof UnresolvedError) {
			code = 500;
		} else {
			code = 500;
		}
	}

	return res.status(code).json({
		message,
		data
	});
};

/**
 * Generate auth token
 * @param {object} options- Options
 * @param {string} options.userId - User id
 * @param {string} options.sessionId - Session id
 * @param {object} options.keys - List of keys
 * @param {object} options.expiries - List of expiries
 * @returns {object} - Tokens
 */
exports.generateAuthToken = (options) => {
	const session = {
		userId: options.userId,
		sessionId: options.sessionId
	};

	const xsrfToken = randToken.generate(24);

	const privateKey = options.keys.jwt + xsrfToken;

	const token = jwt.sign(session, privateKey, {
		expiresIn: options.expiries.authToken
	});

	return {
		token,
		expiry:
			new Date().valueOf() +
			parseInt(options.expiries.authToken, 10) * 60 * 60 * 1000,
		xsrfToken
	};
};

/**
 * Generate refresh token
 * @param {object} options- Options
 * @param {string} options.userId - User id
 * @param {string} options.sessionId - Session id
 * @param {object} options.keys - List of keys
 * @param {object} options.expiries - List of expiries
 * @returns {string} - Token
 */
exports.generateRefreshToken = (options) => {
	const session = {
		userId: options.userId,
		sessionId: options.sessionId
	};

	return jwt.sign(session, options.keys.jwt, {
		expiresIn: options.expiries.refreshToken
	});
};

/**
 * Verify auth token
 * @param {string} jwtKey - Jwt key
 * @param {string} token - auth token
 * @param {string} [xsrfToken=''] - xsrf token
 * @returns {object|error} - Payload or error
 */
exports.verifyToken = (jwtKey, token, xsrfToken = '') => {
	return jwt.verify(token, `${jwtKey}${xsrfToken}`);
};
