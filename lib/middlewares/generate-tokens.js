'use strict';

const {
	response,
	generateAuthToken,
	generateRefreshToken
} = require('../utils');

/**
 * Generate tokens
 * @param {object} config - Config object
 */
module.exports = (config) => {
	return async function generateTokens(req, res, next) {
		if (!req.userId) {
			config.logger.error({
				label: 'generateTokens',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		if (!req.session || !req.session.sessionId) {
			config.logger.error({
				label: 'generateTokens',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		req.authToken = generateAuthToken({
			userId: req.userId,
			sessionId: req.session.sessionId,
			keys: config.keys,
			expiries: config.expiries
		});

		const refreshToken = generateRefreshToken({
			userId: req.userId,
			sessionId: req.session.sessionId,
			keys: config.keys,
			expiries: config.expiries
		});

		req.session.userId = req.userId;

		res.cookie('refreshToken', refreshToken, config.options.cookies);
		res.cookie('xsrf-token', req.authToken.xsrfToken);
		res.cookie('auth-token', req.authToken.token);

		next();
	};
};
