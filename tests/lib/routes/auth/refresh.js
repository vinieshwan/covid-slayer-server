'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');
const cookieSignature = require('cookie-signature');

const Routes = require('../../../../lib/routes/auth/refresh');
const {
	generateAuthToken,
	generateRefreshToken
} = require('../../../../lib/utils');

const sandbox = sinon.createSandbox();

describe('lib/routes/auth/refresh.js', function () {
	let controllers,
		routes,
		server,
		body,
		testRequest,
		middlewares,
		req = {};

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
		jar.setCookie(cookie, `http://localhost:${config.port}/v1/refresh`);

		const authCookie = request.cookie(`auth-token=${auth.token}`);
		jar.setCookie(authCookie, `http://localhost:${config.port}/v1/refresh`);

		const signedCookie = request.cookie(`refreshToken=s%3A${refreshToken}`);
		jar.setCookie(signedCookie, `http://localhost:${config.port}/v1/refresh`);

		testRequest = request.defaults({
			uri: '/v1/refresh',
			baseUrl: `http://localhost:${config.port}`,
			json: true,
			jar
		});

		server = config.server;
		controllers = await config.controllers();
		middlewares = await config.middlewares();

		config.app.use(function (req, res, next) {
			req.userId = '60120cd2368628317d1934fc';
			req.session = {
				sessionId: '40120cd2368628317d1934fc',
				userId: '60120cd2368628317d1934fc'
			};

			next();
		});

		routes = new Routes(config.app, {
			keys: config.keys,
			expiries: config.expiries,
			options: config.options,
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

	after(function (done) {
		server.close(done);
	});

	beforeEach(function () {
		sandbox.stub(controllers.users, 'get').resolves({
			_id: '60120cd2368628317d1934fc',
			email: 'username@email.com',
			name: 'firstname lastname'
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should refresh a', function (done) {
			testRequest.get({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;
				expect(new Date(endpointResponse.data.session.expiry)).to.be.a('date');

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when refreshing a session', function (done) {
			testRequest.get({}, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(500);
				expect(endpointResponse).to.deep.equal({
					message: 'error',
					data: {}
				});

				done();
			});
		});
	});
});
