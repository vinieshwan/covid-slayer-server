'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const expireSessionMiddleware = require('../../../lib/middlewares/expire-session');

describe('/lib/middlewares/expire-session.js', () => {
	let req, res, middleware, controllers;

	const sandbox = sinon.createSandbox();

	before(async () => {
		controllers = await config.controllers();

		middleware = expireSessionMiddleware({
			controllers,
			options: config.options,
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
			json: sandbox.stub().returnsThis(),
			clearCookie: sandbox.stub().returnsThis()
		};

		sandbox.stub(controllers.sessions, 'expireSession').resolves(true);
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should expire session', async function () {
		await middleware(req, res, () => {
			expect(req.session).to.be.an('undefined');
			expect(res.clearCookie.calledTwice).to.be.true;
			expect(res.clearCookie.getCall(0).args.length).to.equal(2);
			expect(res.clearCookie.getCall(0).args[0]).to.equal('refreshToken');
			expect(res.clearCookie.getCall(0).args[1]).to.deep.equal({
				httpOnly: true,
				secure: false,
				signed: true
			});

			expect(res.clearCookie.getCall(1).args.length).to.equal(1);
			expect(res.clearCookie.getCall(1).args[0]).to.equal('xsrf-token');
		});
	});

	it('should return error when there was an error when expiring a session', async function () {
		controllers.sessions.expireSession.rejects(new Error('error'));

		await middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([500]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'error', data: {} }
			]);
			expect(res.clearCookie.calledTwice).to.be.true;
			expect(req.session).to.be.an('undefined');
		});
	});
});
