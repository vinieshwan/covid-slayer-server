'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const verifySessionMiddleware = require('../../../lib/middlewares/verify-session');

describe('/lib/middlewares/verify-session.js', () => {
	let req, res, middleware, controllers;

	const sandbox = sinon.createSandbox();

	before(async () => {
		controllers = await config.controllers();

		middleware = verifySessionMiddleware({
			controllers,
			logger: config.logger
		});
	});

	beforeEach(function () {
		req = {
			session: {
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc'
			}
		};

		res = {
			status: sandbox.stub().returnsThis(),
			json: sandbox.stub().returnsThis()
		};

		sandbox.stub(controllers.sessions, 'load').resolves({
			sessionId: '40120cd2368628317d1934fc',
			expiry: new Date()
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should verify tokens', async function () {
		await middleware(req, res, () => {
			expect(req.session).to.be.an('object');
			expect(req.session.userId).to.equal('60120cd2368628317d1934fc');
			expect(req.session.sessionId).to.equal('40120cd2368628317d1934fc');
			expect(req.session.expiry).to.be.a('date');
		});
	});

	it('should return error if session is not provided', async function () {
		delete req.session;

		await middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);

			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error if session did not match with the current session', async function () {
		controllers.sessions.load.rejects(new Error('error'));

		await middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([500]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Internal server error: error' }
			]);

			expect(req.session).to.be.an('undefined');
		});
	});
});
