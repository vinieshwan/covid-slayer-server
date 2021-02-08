'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');

const Routes = require('../../../../lib/routes/users/signup');

describe('lib/routes/users/signup.js', function () {
	let controllers, routes, server, body, testRequest;

	const sandbox = sinon.createSandbox();

	before(async function () {
		this.timeout(80000);

		testRequest = request.defaults({
			uri: '/v1/signup',
			baseUrl: `http://localhost:${config.port}`,
			json: true
		});

		server = config.server;
		controllers = await config.controllers();

		sandbox.stub(controllers.users, 'create');
		sandbox.stub(controllers.gameSettings, 'create');

		routes = new Routes(config.app, {
			controllers: {
				users: controllers.users,
				gameSettings: controllers.gameSettings
			},
			logger: config.logger
		});

		routes.setupRoute();

		server.listen(config.port);
	});

	beforeEach(function () {
		body = {
			name: 'John Doe ',
			email: 'john@doe.com',
			password: '123456'
		};

		controllers.users.create.resolves('60120cd2368628317d1934fc');

		controllers.gameSettings.create.resolves(true);
	});

	after(function (done) {
		server.close(done);
	});

	describe('success', function () {
		it('should create user', function (done) {
			testRequest.post({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse).to.deep.equal({
					message: '',
					data: {
						ok: true
					}
				});

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when creating a user', function (done) {
			controllers.users.create.rejects(new Error('test-error'));
			testRequest.post({ body }, function (error, res, endpointResponse) {
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

				testRequest.post({ body }, function (error, res, endpointResponse) {
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

			describe('name', () => {
				it('should respond with error if name is not provided', function (done) {
					delete body.name;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: `should have required property 'name'`
							}
						});

						done();
					});
				});

				it('should respond with error if name is not valid', function (done) {
					body.name = 123;

					testRequest.post({ body }, function (error, res, endpointResponse) {
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

					testRequest.post({ body }, function (error, res, endpointResponse) {
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

					testRequest.post({ body }, function (error, res, endpointResponse) {
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
				it('should respond with error if email is not provided', function (done) {
					delete body.email;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: `should have required property 'email'`
							}
						});

						done();
					});
				});

				it('should respond with error if email is not a string', function (done) {
					body.email = 123;

					testRequest.post({ body }, function (error, res, endpointResponse) {
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

					testRequest.post({ body }, function (error, res, endpointResponse) {
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

					testRequest.post({ body }, function (error, res, endpointResponse) {
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

			describe('password', () => {
				it('should respond with error if password is not provided', function (done) {
					delete body.password;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: `should have required property 'password'`
							}
						});

						done();
					});
				});

				it('should respond with error if password is not valid', function (done) {
					body.password = 123;

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'password'
							}
						});

						done();
					});
				});

				it('should respond with error if password is less than 6 characters', function (done) {
					body.password = 'first';

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'password'
							}
						});

						done();
					});
				});

				it('should respond with error if password is greather than 100 characters', function (done) {
					body.password = 'a'.repeat(101);

					testRequest.post({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Invalid argument(s)',
							data: {
								field: 'password'
							}
						});

						done();
					});
				});
			});
		});
	});
});
