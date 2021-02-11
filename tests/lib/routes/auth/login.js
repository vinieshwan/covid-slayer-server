'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');

const Routes = require('../../../../lib/routes/auth/login');

describe('lib/routes/auth/login.js', function () {
	let controllers,
		routes,
		server,
		body,
		testRequest,
		middlewares,
		req = {};

	const sandbox = sinon.createSandbox();

	before(async function () {
		this.timeout(80000);

		testRequest = request.defaults({
			uri: '/v1/login',
			baseUrl: `http://localhost:${config.port}`,
			json: true
		});

		server = config.server;
		controllers = await config.controllers();
		middlewares = await config.middlewares();

		config.app.use(function (req, res, next) {
			req.userId = '60120cd2368628317d1934fc';
			req.userName = 'name';
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

	beforeEach(function () {
		body = {
			email: 'john@doe.com',
			password: '123456'
		};

		sandbox.stub(controllers.users, 'validate').resolves({
			userId: '60120cd2368628317d1934fc',
			name: 'name'
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(function (done) {
		server.close(done);
	});

	describe('success', function () {
		it('should login a user', function (done) {
			testRequest.post({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;
				expect(new Date(endpointResponse.data.session.expiry)).to.be.a('date');
				expect(endpointResponse.data.session.name).to.equal('name');
				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when logging in', function (done) {
			controllers.users.validate.rejects(new Error('test-error'));
			testRequest.post({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(500);
				expect(endpointResponse).to.deep.equal({
					message: 'Internal server error: test-error'
				});

				done();
			});
		});

		describe('validation', function () {
			it('should respond with error if body has additional properties', function (done) {
				body.something = 123;

				testRequest.post({ body }, function (error, res, endpointResponse) {
					expect(res.statusCode).to.equal(400);
					expect(endpointResponse).to.deep.equal({
						message: 'Bad request: should NOT have additional properties'
					});

					done();
				});
			});

			describe('email', () => {
				it('should respond with error if email is not provided', function (done) {
					delete body.email;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: "Bad request: should have required property 'email'"
						});

						done();
					});
				});

				it('should respond with error if email is not a string', function (done) {
					body.email = 123;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: email'
						});

						done();
					});
				});

				it('should respond with error if email is not a valid email', function (done) {
					body.email = 'aaaaa';

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: email'
						});

						done();
					});
				});

				it('should respond with error if email is greather than 100 characters', function (done) {
					body.email = 'a'.repeat(255) + '@yahoo.com';

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: email'
						});

						done();
					});
				});
			});

			describe('password', () => {
				it('should respond with error if password is not provided', function (done) {
					delete body.password;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: "Bad request: should have required property 'password'"
						});

						done();
					});
				});

				it('should respond with error if password is not valid', function (done) {
					body.password = 123;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: password'
						});

						done();
					});
				});

				it('should respond with error if password is less than 6 characters', function (done) {
					body.password = 'first';

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: password'
						});

						done();
					});
				});

				it('should respond with error if password is greather than 100 characters', function (done) {
					body.password = 'a'.repeat(101);

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: password'
						});

						done();
					});
				});
			});
		});
	});
});
