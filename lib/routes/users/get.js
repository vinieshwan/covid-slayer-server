'use strict';

const { response } = require('../../../lib/utils');

/** Endpoint for getting user info */
class GetUser {
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
			'/v1/user',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.getUser.bind(this)
		);
	}

	/** Retrieve user info */
	async getUser(req, res, next) {
		let user;

		try {
			user = await this.controllers.users.get(req.session.userId);
		} catch (error) {
			this.logger.error({
				label: 'GetUser',
				message: error.message,
				data: {
					session: req.session
				}
			});

			return response(res, {
				error
			});
		}

		response(res, {
			data: {
				ok: true,
				user
			}
		});

		next();
	}
}

module.exports = GetUser;
