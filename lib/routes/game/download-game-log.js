'use strict';

const Ajv = require('ajv').default;

const { response } = require('../../../lib/utils');

/** Endpoint for downloading a game */
class DownloadGameLog {
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
			properties: {
				game: {
					type: 'string'
				}
			},
			required: ['game']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.get(
			'/v1/download-game-log',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.validateRequest.bind(this),
			this.downloadGameLog.bind(this)
		);
	}

	/** Validate params request */
	validateRequest(req, res, next) {
		if (!this.validate(req.query)) {
			this.logger.error({
				label: 'DownloadGameLog',
				message: 'Invalid argument(s)',
				data: {
					query: req.query
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

	/** Download game log */
	async downloadGameLog(req, res, next) {
		const log = `/game-logs/${req.session.userId}_${req.query.game}.log`;

		const options = {
			root: this.config.rootPath
		};

		res.sendFile(log, options, (error) => {
			if (error) {
				this.logger.error({
					label: 'DownloadGameLog',
					message: 'Error downloading file',
					data: {
						query: req.query,
						path: log,
						error
					}
				});

				next(error);
			}

			res.end();
		});
	}
}

module.exports = DownloadGameLog;
