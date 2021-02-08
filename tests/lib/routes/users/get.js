'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');
const cookieSignature = require('cookie-signature');

const Routes = require('../../../../lib/routes/users/get');
const {
	generateAuthToken,
	generateRefreshToken
} = require('../../../../lib/utils');

describe('lib/routes/users/get.js', function () {
	let controllers, routes, server, testRequest, middlewares;

	const sandbox = sinon.createSandbox();

	before(async function () {
		this.timeout(80000);

		const auth = generateAuthToken({
			userId: '60120cd2368628317d1934fc',
			sessionId: '40120cd2368628317d1934fc',
			keys: config.keys,
			expiries: config.expiries
		});

		const refreshToken = cookieSignature.sign(
			generateRefreshToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: config.expiries
			}),
			config.keys.cookie
		);

		const jar = request.jar();
		const cookie = request.cookie(`xsrf-token=${auth.xsrfToken}`);
		jar.setCookie(cookie, `http://localhost:${config.port}/v1/user`);

		const authCookie = request.cookie(`auth-token=${auth.token}`);
		jar.setCookie(
			authCookie,
			`http://localhost:${config.port}/v1/update-game-settings`
		);

		const signedCookie = request.cookie(`refreshToken=s%3A${refreshToken}`);
		jar.setCookie(signedCookie, `http://localhost:${config.port}/v1/user`);

		testRequest = request.defaults({
			uri: '/v1/user',
			baseUrl: `http://localhost:${config.port}`,
			json: true,
			jar: jar
		});

		server = config.server;
		controllers = await config.controllers();
		middlewares = await config.middlewares();

		routes = new Routes(config.app, {
			keys: config.keys,
			middlewares,
			controllers: {
				users: controllers.users,
				sessions: controllers.sessions
			},
			logger: config.logger
		});

		routes.setupRoute();

		server.listen(config.port);
	});

	beforeEach(function () {
		sandbox.stub(controllers.users, 'get').resolves({
			_id: '60120cd2368628317d1934fc',
			email: 'username@email.com',
			name: 'firstname lastname'
		});
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('success', function () {
		it('should retrieve user information', function (done) {
			testRequest.get({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;
				expect(endpointResponse.data.user).to.be.an('object');
				expect(endpointResponse.data.user).to.deep.equal({
					_id: '60120cd2368628317d1934fc',
					email: 'username@email.com',
					name: 'firstname lastname'
				});

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when retrieving user information', function (done) {
			controllers.users.get.rejects(new Error('test-error'));
			testRequest.get({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(500);
				expect(endpointResponse).to.deep.equal({
					message: 'test-error',
					data: {}
				});

				done();
			});
		});
	});
});
