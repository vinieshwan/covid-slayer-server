'use strict';

const { response, verifyToken } = require('../utils');

/**
 * Verify tokens from cookies and headers
 * @param {object} config - Config object
 */
module.exports = (config) => {
	return function verifyTokens(req, res, next) {
		let token = req.cookies['auth-token'];

		if (!token) {
			config.logger.error({
				label: 'verifyTokens-token',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		token = token.replace('Bearer ', '');

		const xsrfToken = req.cookies['xsrf-token'];

		if (!xsrfToken) {
			config.logger.error({
				label: 'verifyTokens',
				message: 'Forbidden Access'
			});

			return next(
				response(res, {
					statusCode: 403,
					message: 'Forbidden Access'
				})
			);
		}

		const { signedCookies = {} } = req;
		const { refreshToken } = signedCookies;

		if (!refreshToken) {
			config.logger.error({
				label: 'verifyTokens-refreshToken',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		let payload;

		try {
			payload = verifyToken(config.keys.jwt, token, xsrfToken);
		} catch (error) {
			config.logger.error({
				label: 'verifyTokens',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		req.session = payload;
		req.userId = payload.userId;

		next();
	};
};
