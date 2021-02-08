'use strict';

const { response } = require('../../../lib/utils');

/** Endpoint for user logout */
class Logout {
	constructor(app, config) {
		this.app = app;
		this.config = config;
		this.middlewares = config.middlewares;
		this.controllers = config.controllers;
		this.logger = config.logger;
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/logout',
			this.middlewares.expireSession.bind(this),
			this.expireSession.bind(this)
		);
	}

	/** Send response */
	async expireSession(req, res, next) {
		response(res, {
			data: {
				ok: true
			}
		});

		next();
	}
}

module.exports = Logout;
