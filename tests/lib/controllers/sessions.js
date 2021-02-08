'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const SessionsController = require('../../../lib/controllers/sessions');
const {
	UnresolvedError,
	UnAuthorizedError
} = require('../../../lib/utils/errors');

describe('/lib/controllers/game-settings.js', () => {
	let sessionsController, userId, models, response, sessionId, expiry;

	const sandbox = sinon.createSandbox();

	before(async () => {
		userId = '60120cd2368628317d1934fb';
		sessionId = '60120cd2368628317d1934fa';
		expiry = new Date(new Date().valueOf() + config.expiries.refreshToken);

		models = await config.models();

		sessionsController = new SessionsController({
			models,
			expiries: config.expiries
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should contain sessions model as property', function () {
			expect(sessionsController.model).to.deep.equal(models.sessions);
		});

		it('should throw if model was not provided', function () {
			expect(() => {
				new SessionsController({});
			}).to.throw('Models were not provided');
		});

		it('should throw if model was not provided', function () {
			expect(() => {
				new SessionsController({ models: {} });
			}).to.throw('Sessions model was not provided');
		});

		it('should throw if expiries was not provided', function () {
			expect(() => {
				new SessionsController({ models });
			}).to.throw('Expiries were not provided');
		});
	});

	describe('#create', () => {
		beforeEach(() => {
			response = {
				ok: 1,
				n: 1,
				ops: [
					{
						_id: sessionId,
						expiresOn: expiry
					}
				]
			};

			sandbox.stub(sessionsController.model, 'create').resolves(response);
		});

		it(`should return true if session was successfully created`, async () => {
			const settings = await sessionsController.create(userId);

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				sessionId,
				expiry
			});

			expect(sessionsController.model.create.calledOnce).to.be.true;
			expect(sessionsController.model.create.getCall(0).args.length).to.equal(
				2
			);
			expect(sessionsController.model.create.getCall(0).args[0]).to.equal(
				userId
			);
			expect(sessionsController.model.create.getCall(0).args[1]).to.be.a(
				'Date'
			);
		});

		it('should throw if session was not created', async () => {
			response.n = 0;

			let error;

			try {
				await sessionsController.create(userId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(sessionsController.model.create.calledOnce).to.be.true;
		});
	});

	describe('#load', () => {
		beforeEach(() => {
			response = {
				_id: sessionId,
				expiresOn: expiry,
				expired: false
			};
			sandbox.stub(sessionsController.model, 'load').resolves(response);
		});

		it(`should load a user's session`, async () => {
			const settings = await sessionsController.load(userId, sessionId);

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				sessionId,
				expiry
			});

			expect(sessionsController.model.load.calledOnce).to.be.true;
			expect(sessionsController.model.load.getCall(0).args).to.deep.equal([
				userId,
				sessionId,
				{
					fields: {
						expiresOn: 1,
						expired: 1
					}
				}
			]);
		});

		it('should throw if settings returned null', async () => {
			sessionsController.model.load.resolves(null);

			let error;

			try {
				await sessionsController.load('60120cd2368628317d1934fc', sessionId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(sessionsController.model.load.calledOnce).to.be.true;
		});

		it('should throw if session already expired', async () => {
			response.expired = true;

			let error;

			try {
				await sessionsController.load('60120cd2368628317d1934fc', sessionId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnAuthorizedError);

			expect(sessionsController.model.load.calledOnce).to.be.true;
		});
	});

	describe('#refreshSession', () => {
		let now;

		beforeEach(() => {
			now = new Date();
			sandbox.useFakeTimers(now);

			response = {
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: sessionId,
					expired: false,
					userId,
					createdOn: now,
					updatedOn: now,
					expiresOn: expiry
				}
			};

			sandbox.stub(sessionsController.model, 'updateExpiry').resolves(response);
		});

		it(`should update a user's session`, async () => {
			const settings = await sessionsController.refreshSession(
				userId,
				sessionId
			);

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				sessionId,
				expiry
			});

			expect(sessionsController.model.updateExpiry.calledOnce).to.be.true;
			expect(
				sessionsController.model.updateExpiry.getCall(0).args.length
			).to.equal(3);
			expect(sessionsController.model.updateExpiry.getCall(0).args[0]).to.equal(
				userId
			);
			expect(sessionsController.model.updateExpiry.getCall(0).args[1]).to.equal(
				sessionId
			);
			expect(sessionsController.model.updateExpiry.getCall(0).args[2]).to.be.a(
				'Date'
			);
		});

		it('should throw if settings returned null', async () => {
			response.value = null;

			let error;

			try {
				await sessionsController.refreshSession(
					'60120cd2368628317d1934fc',
					sessionId
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(sessionsController.model.updateExpiry.calledOnce).to.be.true;
		});

		it('should throw if session already expired', async () => {
			response.expired = true;

			let error;

			try {
				await sessionsController.refreshSession(
					'60120cd2368628317d1934fc',
					sessionId
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnAuthorizedError);

			expect(sessionsController.model.updateExpiry.calledOnce).to.be.true;
		});
	});

	describe('#expireSession', () => {
		let now;

		beforeEach(() => {
			now = new Date();
			sandbox.useFakeTimers(now);

			response = {
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: sessionId,
					expired: false,
					userId,
					createdOn: now,
					updatedOn: now,
					expiresOn: expiry
				}
			};

			sandbox.stub(sessionsController.model, 'expire').resolves(response);
		});

		it(`should expire a user's session`, async () => {
			expect(await sessionsController.expireSession(userId, sessionId)).to.be
				.true;

			expect(sessionsController.model.expire.calledOnce).to.be.true;
			expect(sessionsController.model.expire.getCall(0).args).to.deep.equal([
				userId,
				sessionId
			]);
		});

		it('should throw if settings returned null', async () => {
			response.value = null;

			let error;

			try {
				await sessionsController.expireSession(
					'60120cd2368628317d1934fc',
					sessionId
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(sessionsController.model.expire.calledOnce).to.be.true;
		});
	});
});
