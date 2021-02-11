'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const generateTokensMiddleware = require('../../../lib/middlewares/generate-tokens');

describe('/lib/middlewares/generate-tokens.js', () => {
	let req, res, middleware;

	const sandbox = sinon.createSandbox();

	before(() => {
		middleware = generateTokensMiddleware(config);
	});

	beforeEach(function () {
		req = {
			userId: '60120cd2368628317d1934fc',
			session: { sessionId: '40120cd2368628317d1934fc' }
		};

		res = {
			status: sandbox.stub().returnsThis(),
			json: sandbox.stub().returnsThis(),
			cookie: sandbox.stub().returnsThis()
		};
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should generate tokens', function () {
		middleware(req, res, () => {
			expect(req.session).to.be.an('object');
			expect(req.session.userId).to.equal('60120cd2368628317d1934fc');
			expect(req.session.sessionId).to.equal('40120cd2368628317d1934fc');

			expect(res.cookie.calledTwice).to.be.true;
			expect(res.cookie.getCall(0).args.length).to.equal(3);
			expect(res.cookie.getCall(0).args[0]).to.equal('refreshToken');
			expect(res.cookie.getCall(0).args[1]).to.be.a('string');
			expect(res.cookie.getCall(0).args[1].length).to.equal(228);
			expect(res.cookie.getCall(0).args[2]).to.deep.equal({
				httpOnly: true,
				secure: false,
				signed: true
			});

			expect(res.cookie.getCall(1).args.length).to.equal(2);
			expect(res.cookie.getCall(1).args[0]).to.equal('xsrf-token');
			expect(res.cookie.getCall(1).args[1]).to.be.a('string');
			expect(res.cookie.getCall(1).args[1].length).to.equal(24);
		});
	});

	it('should return error if userId is not defined', function () {
		delete req.userId;

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);
			expect(res.cookie.notCalled).to.be.true;
			expect(req.session).to.deep.equal({
				sessionId: '40120cd2368628317d1934fc'
			});
		});
	});

	it('should return error if session is not provided', function () {
		delete req.session;

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);
			expect(res.cookie.notCalled).to.be.true;
			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error if sessionId is not provided', function () {
		delete req.session.sessionId;

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);
			expect(res.cookie.notCalled).to.be.true;
			expect(req.session).to.eql({});
		});
	});
});
