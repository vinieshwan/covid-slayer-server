'use strict';

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');
const ajvKeywords = require('ajv-keywords');

const { response } = require('../../../lib/utils');

/** Endpoint for updating user information */
class UpdateUser {
	constructor(app, config) {
		this.app = app;
		this.config = config;
		this.middlewares = config.middlewares;
		this.controllers = config.controllers;
		this.logger = config.logger;

		const ajv = new Ajv();

		ajvKeywords(ajv, ['transform']);
		addFormats(ajv, ['email']);

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			minProperties: 1,
			properties: {
				name: {
					type: 'string',
					allOf: [
						{
							transform: ['trim']
						},
						{
							minLength: 6,
							maxLength: 100
						}
					]
				},
				email: {
					type: 'string',
					format: 'email',
					maxLength: 255
				}
			}
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.put(
			'/v1/update-user',
			this.middlewares.verifyTokens.bind(this),
			this.middlewares.verifySession.bind(this),
			this.validateRequest.bind(this),
			this.getSettings.bind(this)
		);
	}

	/** Validate body request */
	validateRequest(req, res, next) {
		if (!this.validate(req.body)) {
			this.logger.error({
				label: 'UpdateUser',
				message: 'Invalid argument(s)',
				data: {
					body: req.body
				}
			});

			return response(res, {
				statusCode: 400,
				message: 'Invalid argument(s)',
				data: {
					field:
						this.validate.errors[0].dataPath.substr(1) ||
						this.validate.errors[0].message
				}
			});
		}

		next();
	}

	/** Retrieve user information */
	async getSettings(req, res, next) {
		let user;

		try {
			user = await this.controllers.users.update(req.session.userId, req.body);
		} catch (error) {
			this.logger.error({
				label: 'UpdateUser',
				message: error.message,
				data: {
					body: req.body
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

module.exports = UpdateUser;
