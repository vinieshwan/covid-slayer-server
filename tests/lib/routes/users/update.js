'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');
const cookieSignature = require('cookie-signature');

const Routes = require('../../../../lib/routes/users/update');
const {
	generateAuthToken,
	generateRefreshToken
} = require('../../../../lib/utils');

describe('lib/routes/users/update.js', function () {
	let controllers, routes, server, testRequest, middlewares, body;

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
		jar.setCookie(cookie, `http://localhost:${config.port}/v1/update-user`);

		const authCookie = request.cookie(`auth-token=${auth.token}`);
		jar.setCookie(
			authCookie,
			`http://localhost:${config.port}/v1/update-game-settings`
		);

		const signedCookie = request.cookie(`refreshToken=s%3A${refreshToken}`);
		jar.setCookie(
			signedCookie,
			`http://localhost:${config.port}/v1/update-user`
		);

		testRequest = request.defaults({
			uri: '/v1/update-user',
			baseUrl: `http://localhost:${config.port}`,
			json: true,
			jar
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
		sandbox.stub(controllers.users, 'update').resolves({
			_id: '60120cd2368628317d1934fc',
			email: 'username@email.com',
			name: 'New name'
		});

		body = {
			name: 'New name'
		};
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('success', function () {
		it('should update user information', function (done) {
			testRequest.put({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;
				expect(endpointResponse.data.user).to.be.an('object');
				expect(endpointResponse.data.user).to.deep.equal({
					_id: '60120cd2368628317d1934fc',
					email: 'username@email.com',
					name: 'New name'
				});

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when updating user information', function (done) {
			controllers.users.update.rejects(new Error('test-error'));
			testRequest.put({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(500);
				expect(endpointResponse).to.deep.equal({
					message: 'test-error',
					data: {}
				});

				done();
			});
		});

		describe('validation', function () {
			it('should respond with error if body has additional properties', function (done) {
				body.something = 123;

				testRequest.put({ body }, function (error, res, endpointResponse) {
					expect(res.statusCode).to.equal(400);
					expect(endpointResponse).to.deep.equal({
						message: 'Invalid argument(s)',
						data: {
							field: 'should NOT have additional properties'
						}
					});

					done();
				});
			});

			it('should respond with error if body is empty', function (done) {
				body = {};

				testRequest.put({ body }, function (error, res, endpointResponse) {
					expect(res.statusCode).to.equal(400);
					expect(endpointResponse).to.deep.equal({
						message: 'Invalid argument(s)',
						data: {
							field: 'should NOT have fewer than 1 items'
						}
					});

					done();
				});
			});

			describe('name', () => {
				it('should respond with error if name is not valid', function (done) {
					body.name = 123;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'name'
							}
						});

						done();
					});
				});

				it('should respond with error if name is less than 6 characters', function (done) {
					body.name = 'first';

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'name'
							}
						});

						done();
					});
				});

				it('should respond with error if name is greather than 100 characters', function (done) {
					body.name = 'a'.repeat(101);

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'name'
							}
						});

						done();
					});
				});
			});

			describe('email', () => {
				it('should respond with error if email is not a string', function (done) {
					body.email = 123;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'email'
							}
						});

						done();
					});
				});

				it('should respond with error if email is not a valid email', function (done) {
					body.email = 'aaaaa';

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'email'
							}
						});

						done();
					});
				});

				it('should respond with error if email is greather than 100 characters', function (done) {
					body.email = 'a'.repeat(255) + '@yahoo.com';

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'email'
							}
						});

						done();
					});
				});
			});
		});
	});
});
