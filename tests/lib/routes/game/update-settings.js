'use strict';

const sinon = require('sinon');
const request = require('request');
const { expect } = require('chai');
const cookieSignature = require('cookie-signature');

const Routes = require('../../../../lib/routes/game/update-settings');
const {
	generateAuthToken,
	generateRefreshToken
} = require('../../../../lib/utils');

describe('lib/routes/game/update-settings.js', function () {
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
		jar.setCookie(
			cookie,
			`http://localhost:${config.port}/v1/update-game-settings`
		);

		const authCookie = request.cookie(`auth-token=${auth.token}`);
		jar.setCookie(
			authCookie,
			`http://localhost:${config.port}/v1/update-game-settings`
		);

		const signedCookie = request.cookie(`refreshToken=s%3A${refreshToken}`);
		jar.setCookie(
			signedCookie,
			`http://localhost:${config.port}/v1/update-game-settings`
		);

		testRequest = request.defaults({
			uri: '/v1/update-game-settings',
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
				gameSettings: controllers.gameSettings,
				sessions: controllers.sessions
			},
			logger: config.logger
		});

		routes.setupRoute();

		server.listen(config.port);
	});

	beforeEach(function () {
		sandbox.stub(controllers.gameSettings, 'update').resolves({
			_id: '60120cd2368628317d1934fc',
			userId: '60120cd2368628317d1934fa',
			playerName: 'Player 1',
			wins: 0,
			losses: 0,
			gamesPlayed: 0,
			gameTime: 60
		});

		body = {
			playerName: 'Player 1',
			commentary: 'sample\nsasasa'
		};
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('success', function () {
		it('should update game settings', function (done) {
			testRequest.put({ body }, function (error, res, endpointResponse) {
				expect(res.statusCode).to.equal(200);
				expect(endpointResponse.message).to.equal('');
				expect(endpointResponse.data.ok).to.be.true;
				expect(endpointResponse.data.settings).to.be.an('object');
				expect(endpointResponse.data.settings).to.deep.equal({
					_id: '60120cd2368628317d1934fc',
					userId: '60120cd2368628317d1934fa',
					playerName: 'Player 1',
					wins: 0,
					losses: 0,
					gamesPlayed: 0,
					gameTime: 60
				});

				done();
			});
		});
	});

	describe('errors', function () {
		it('should respond with error if there was an error occurred when updating game settings', function (done) {
			controllers.gameSettings.update.rejects(new Error('test-error'));
			testRequest.put({ body }, function (error, res, endpointResponse) {
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

				testRequest.put({ body }, function (error, res, endpointResponse) {
					expect(res.statusCode).to.equal(400);
					expect(endpointResponse).to.deep.equal({
						message: 'Bad request: should NOT have additional properties'
					});

					done();
				});
			});

			it('should respond with error if body is empty', function (done) {
				body = {};

				testRequest.put({ body }, function (error, res, endpointResponse) {
					expect(res.statusCode).to.equal(400);
					expect(endpointResponse).to.deep.equal({
						message: 'Bad request: should NOT have fewer than 1 items'
					});

					done();
				});
			});

			describe('playerName', () => {
				it('should respond with error if playerName is not a string', function (done) {
					body.playerName = 123;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: playerName'
						});

						done();
					});
				});

				it('should respond with error if playerName is empty', function (done) {
					body.playerName = '';

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: playerName'
						});

						done();
					});
				});

				it('should respond with error if playerName is greather than 100 characters', function (done) {
					body.playerName = 'a'.repeat(101);

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: playerName'
						});

						done();
					});
				});
			});

			describe('gameTime', () => {
				it('should respond with error if gameTime is not a number', function (done) {
					body.gameTime = 'sdsdsd';

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: gameTime'
						});

						done();
					});
				});

				it('should respond with error if gameTime is lesser than 5', function (done) {
					body.gameTime = 1;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: gameTime'
						});

						done();
					});
				});
			});

			describe('won', () => {
				it('should respond with error if won is not valid', function (done) {
					body.won = 123;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: won'
						});

						done();
					});
				});
			});

			describe('lost', () => {
				it('should respond with error if lost is not valid', function (done) {
					body.lost = 123;

					testRequest.put({ body }, function (error, res, endpointResponse) {
						expect(res.statusCode).to.equal(400);
						expect(endpointResponse).to.deep.equal({
							message: 'Bad request: lost'
						});

						done();
					});
				});
			});
		});
	});
});
