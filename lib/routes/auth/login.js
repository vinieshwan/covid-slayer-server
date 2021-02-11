'use strict';

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');
const { response } = require('../../utils/index');

/** Endpoint for user login */
class Login {
	constructor(app, config) {
		this.app = app;
		this.config = config;
		this.middlewares = config.middlewares;
		this.controllers = config.controllers;
		this.logger = config.logger;

		const ajv = new Ajv();

		addFormats(ajv, ['email']);

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			properties: {
				email: {
					type: 'string',
					format: 'email',
					maxLength: 255
				},
				password: {
					type: 'string',
					minLength: 6,
					maxLength: 100
				}
			},
			required: ['email', 'password']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/login',
			this.validateRequest.bind(this),
			this.verifyLogin.bind(this),
			this.middlewares.generateSession.bind(this),
			this.middlewares.generateTokens.bind(this),
			this.loginUser.bind(this)
		);
	}

	/** Validate body request */
	validateRequest(req, res, next) {
		if (!this.validate(req.body)) {
			this.logger.error({
				label: 'Login',
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

	/** Verify login */
	async verifyLogin(req, res, next) {
		let user;

		try {
			user = await this.controllers.users.validate(
				req.body.email,
				req.body.password
			);
		} catch (error) {
			this.logger.error({
				label: 'Login',
				message: error.message,
				data: {
					body: req.body
				}
			});

			return response(res, {
				error
			});
		}

		req.userId = user.userId;
		req.userName = user.name;
		req.avatar = user.avatar;

		next();
	}

	/** Process user login */
	async loginUser(req, res, next) {
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

module.exports = Login;
