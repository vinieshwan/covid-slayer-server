'use strict';

const { response } = require('../utils/');

/**
 * Verify session
 * @param {object} config - Config object
 */
module.exports = (config) => {
	return async function verifySession(req, res, next) {
		if (!req.session) {
			config.logger.error({
				label: 'verifySession',
				message: 'Unauthorized Access'
			});

			return next(
				response(res, {
					statusCode: 401,
					message: 'Unauthorized Access'
				})
			);
		}

		let session;

		try {
			session = await config.controllers.sessions.load(
				req.session.userId,
				req.session.sessionId
			);
		} catch (error) {
			config.logger.error({
				label: 'verifySession',
				message: 'Unauthorized Access',
				data: req.session
			});

			delete req.session;

			return next(
				response(res, {
					error
				})
			);
		}

		req.session = {
			...req.session,
			...session
		};

		next();
	};
};
