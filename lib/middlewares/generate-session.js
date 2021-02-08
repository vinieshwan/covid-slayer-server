'use strict';

const { response } = require('../utils');

/**
 * Generate session
 * @param {object} config - Config object
 */
module.exports = (config) => {
	return async function generateSession(req, res, next) {
		if (!req.userId) {
			config.logger.error({
				label: `generateSession - ${req.userId}`,
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

		if (req.session && req.session.sessionId !== undefined) {
			try {
				await config.controllers.sessions.expireSession(
					req.userId,
					req.session.sessionId
				);
			} catch (error) {
				config.logger.error({
					label: 'generateSession',
					message: error.message,
					data: {
						body: req.body
					}
				});

				return response(res, {
					error
				});
			}
		}

		try {
			session = await config.controllers.sessions.create(req.userId);
		} catch (error) {
			config.logger.error({
				label: 'generateSession',
				message: error.message,
				data: {
					body: req.body
				}
			});

			return response(res, {
				error
			});
		}

		req.session = session;

		next();
	};
};
