'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const generateSessionMiddleware = require('../../../lib/middlewares/generate-session');

describe('/lib/middlewares/generate-session.js', () => {
	let req, res, middleware, controllers, now;

	const sandbox = sinon.createSandbox();

	before(async () => {
		controllers = await config.controllers();

		middleware = generateSessionMiddleware({
			controllers,
			options: config.options,
			logger: config.logger
		});
	});

	beforeEach(function () {
		now = new Date();
		sandbox.useFakeTimers(now);
		req = {
			userId: '60120cd2368628317d1934fc'
		};

		res = {
			status: sandbox.stub().returnsThis(),
			json: sandbox.stub().returnsThis(),
			clearCookie: sandbox.stub().returnsThis()
		};

		sandbox.stub(controllers.sessions, 'create').resolves({
			sessionId: '40120cd2368628317d1934fc',
			expiry: now
		});

		sandbox.stub(controllers.sessions, 'expireSession').resolves(true);
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should generate session', async function () {
		await middleware(req, res, () => {
			expect(controllers.sessions.create.calledOnce).to.be.true;
			expect(controllers.sessions.expireSession.notCalled).to.be.true;
			expect(req.session).to.deep.equal({
				sessionId: '40120cd2368628317d1934fc',
				expiry: now
			});
		});
	});

	it('should delete previous session and generation new session if sessionId is present', async function () {
		req.session = {
			sessionId: '40120cd2368628317d1934fd'
		};

		await middleware(req, res, () => {
			expect(controllers.sessions.expireSession.calledOnce).to.be.true;
			expect(controllers.sessions.create.calledOnce).to.be.true;
			expect(req.session).to.deep.equal({
				sessionId: '40120cd2368628317d1934fc',
				expiry: now
			});
		});
	});

	it('should return error when there was an error expiring a session', async function () {
		req.session = {
			sessionId: '40120cd2368628317d1934fd'
		};

		controllers.sessions.expireSession.rejects(new Error('error'));

		await middleware(req, res, () => {
			expect(controllers.sessions.expireSession.calledOnce).to.be.true;
			expect(controllers.sessions.create.notCalled).to.be.true;
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);

			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error if userId is undefined', async function () {
		delete req.userId;

		await middleware(req, res, (error) => {
			expect(controllers.sessions.create.notCalled).to.be.true;
			expect(controllers.sessions.expireSession.notCalled).to.be.true;
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);

			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error when there was an error when generating a session', async function () {
		controllers.sessions.create.rejects(new Error('error'));

		await middleware(req, res, (error) => {
			expect(controllers.sessions.create.calledOnce).to.be.true;
			expect(controllers.sessions.expireSession.notCalled).to.be.true;
			expect(error.status.getCall(0).args).to.deep.equal([500]);
			expect(error.json.getCall(0).args).to.deep.equal([{ message: 'error' }]);

			expect(req.session).to.be.an('undefined');
		});
	});
});
