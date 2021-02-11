'use strict';

const request = require('request');
const { expect } = require('chai');
const sinon = require('sinon');
const Routes = require('../../../../lib/routes/auth/logout');

describe('lib/routes/auth/logout.js', function () {
	let controllers,
		routes,
		server,
		testRequest,
		middlewares,
		req = {};

	before(async function () {
		this.timeout(80000);

		testRequest = request.defaults({
			uri: '/v1/logout',
			baseUrl: `http://localhost:${config.port}`,
			json: true
		});

		server = config.server;
		controllers = await config.controllers();
		middlewares = await config.middlewares();

		config.app.use(function (req, res, next) {
			req.session = {
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc'
			};

			next();
		});

		routes = new Routes(config.app, {
			options: config.options,
			middlewares,
			controllers: {
				sessions: controllers.sessions
			},
			logger: config.logger
		});

		routes.setupRoute();

		server.listen(config.port);
	});

	after(function (done) {
		server.close(done);
	});

	describe('success', function () {
		it('should logout a user', function (done) {
			testRequest.post({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when logging in', function (done) {
			testRequest.post({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(500);
				expect(endpointResponse).to.deep.equal({
					message: 'Internal server error: error'
				});

				done();
			});
		});
	});
});
