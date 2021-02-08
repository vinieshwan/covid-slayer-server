'use strict';

const { response } = require('../../../lib/utils');

/** Endpoint for user game settings */
class GetSettings {
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
			'/v1/game-settings',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.getSettings.bind(this)
		);
	}

	/** Retrieve game settings */
	async getSettings(req, res, next) {
		let settings;

		try {
			settings = await this.controllers.gameSettings.get(req.session.userId);
		} catch (error) {
			this.logger.error({
				label: 'GetSettings',
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
				settings
			}
		});

		next();
	}
}

module.exports = GetSettings;
