'use strict';

const { response } = require('../../utils/index');

/** Endpoint for session refresh */
class Refresh {
	constructor(app, config) {
		this.app = app;
		this.config = config;
		this.middlewares = config.middlewares;
		this.controllers = config.controllers;
		this.logger = config.logger;
	}

	/** Setup route */
	setupRoute() {
		this.app.get(
			'/v1/refresh',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.retrieveUser.bind(this),
			this.middlewares.generateSession.bind(this),
			this.middlewares.generateTokens.bind(this),
			this.refreshSession.bind(this)
		);
	}

	/** Retrieve user */
	async retrieveUser(req, res, next) {
		let user;

		try {
			user = await this.controllers.users.get(req.userId);
		} catch (error) {
			this.logger.error({
				label: 'Refresh',
				message: error.message,
				data: {
					session: req.session
				}
			});

			return response(res, {
				error
			});
		}

		req.userName = user.name;
		req.avatar = user.avatar;

		next();
	}

	/** Send successful refresh session */
	async refreshSession(req, res, next) {
		response(res, {
			data: {
				ok: true,
				session: {
					expiry: req.authToken.expiry,
					name: req.userName,
					avatar: req.avatar
				}
			}
		});

		next();
	}
}

module.exports = Refresh;
