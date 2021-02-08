'use strict';

const { response } = require('../utils');

/**
 * Expire session
 * @param {object} config - Config object
 */
module.exports = (config) => {
	return async function expireSession(req, res, next) {
		res.clearCookie('refreshToken', config.options.cookies);
		res.clearCookie('xsrf-token');
		res.clearCookie('auth-token');

		try {
			await config.controllers.sessions.expireSession(
				req.session.userId,
				req.session.sessionId
			);
		} catch (error) {
			delete req.session;

			config.logger.error({
				label: 'expireSession',
				message: 'Unresolved Error',
				data: req.session
			});

			return next(
				response(res, {
					error
				})
			);
		}

		delete req.session;

		next();
	};
};
