'use strict';

const Ajv = require('ajv').default;
const { response } = require('../../../lib/utils');
const GameLogger = require('../../utils/game-logger');

/** Endpoint for updating user game settings */
class UpdateSettings {
	constructor(app, config) {
		this.app = app;
		this.config = config;
		this.middlewares = config.middlewares;
		this.controllers = config.controllers;
		this.logger = config.logger;

		const ajv = new Ajv();

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			minProperties: 1,
			properties: {
				playerName: {
					type: 'string',
					minLength: 1,
					maxLength: 100
				},
				gameTime: {
					type: 'number',
					minimum: 5
				},
				won: {
					type: 'boolean'
				},
				lost: {
					type: 'boolean'
				},
				commentary: {
					type: 'string'
				},
				avatar: {
					type: 'string',
					enum: ['witch', 'archer', 'boxer', 'ninja']
				}
			}
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.put(
			'/v1/update-game-settings',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.validateRequest.bind(this),
			this.updateSettings.bind(this)
		);
	}

	/** Validate body request */
	validateRequest(req, res, next) {
		if (!this.validate(req.body)) {
			this.logger.error({
				label: 'UpdateSettings',
				message: 'Invalid argument(s)',
				data: {
					body: req.body
				}
			});

			return response(res, {
				statusCode: 400,
				message: `Bad request: ${
					this.validate.errors[0].dataPath.substr(1) ||
					this.validate.errors[0].message
				}`
			});
		}

		next();
	}

	/** Updates game settings */
	async updateSettings(req, res, next) {
		let settings;

		try {
			settings = await this.controllers.gameSettings.update(
				req.session.userId,
				req.body
			);
		} catch (error) {
			this.logger.error({
				label: 'UpdateSettings',
				message: error.message,
				data: {
					body: req.body
				}
			});

			return response(res, {
				error
			});
		}

		const gameLogger = new GameLogger(
			`${req.session.userId}_${settings.gamesPlayed}`
		);

		gameLogger.info({
			message: req.body.commentary ? req.body.commentary : ' '
		});

		response(res, {
			data: {
				ok: true,
				settings
			}
		});

		next();
	}
}

module.exports = UpdateSettings;
