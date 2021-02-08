'use strict';

const Ajv = require('ajv').default;
const ajvKeywords = require('ajv-keywords');
const addFormats = require('ajv-formats');
const { response } = require('../../utils/index');

/** Endpoint for creating a user */
class SignupUser {
	constructor(app, config) {
		this.app = app;
		this.controllers = config.controllers;
		this.logger = config.logger;

		const ajv = new Ajv();

		ajvKeywords(ajv, ['transform']);
		addFormats(ajv, ['email']);

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
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
				},
				password: {
					type: 'string',
					minLength: 6,
					maxLength: 100
				},
				avatar: {
					type: 'string',
					enum: ['witch', 'archer', 'boxer', 'ninja']
				}
			},
			required: ['name', 'email', 'password', 'avatar']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/signup',
			this.validateRequest.bind(this),
			this.createUser.bind(this)
		);
	}

	/** Validate body request */
	validateRequest(req, res, next) {
		if (!this.validate(req.body)) {
			this.logger.error({
				label: 'Signup',
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

	/** Process user creation */
	async createUser(req, res, next) {
		try {
			const userId = await this.controllers.users.create(req.body);
			await this.controllers.gameSettings.create(userId, req.body.name);
		} catch (error) {
			this.logger.error({
				label: 'Signup',
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
				ok: true
			}
		});

		next();
	}
}

module.exports = SignupUser;
