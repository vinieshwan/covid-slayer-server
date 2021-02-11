'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const verifyTokensMiddleware = require('../../../lib/middlewares/verify-tokens');
const {
	generateAuthToken,
	generateRefreshToken
} = require('../../../lib/utils');

describe('/lib/middlewares/verify-tokens.js', () => {
	let req, res, middleware;

	const sandbox = sinon.createSandbox();

	before(() => {
		middleware = verifyTokensMiddleware(config);
	});

	beforeEach(function () {
		const auth = generateAuthToken({
			userId: '60120cd2368628317d1934fc',
			sessionId: '40120cd2368628317d1934fc',
			keys: config.keys,
			expiries: config.expiries
		});

		req = {
			cookies: {
				'xsrf-token': auth.xsrfToken,
				'auth-token': auth.token
			},
			signedCookies: {
				refreshToken: generateRefreshToken({
					userId: '60120cd2368628317d1934fc',
					sessionId: '40120cd2368628317d1934fc',
					keys: config.keys,
					expiries: config.expiries
				})
			}
		};

		res = {
			status: sandbox.stub().returnsThis(),
			json: sandbox.stub().returnsThis()
		};
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should verify tokens', function () {
		middleware(req, res, () => {
			expect(req.session).to.be.an('object');
			expect(req.session.userId).to.equal('60120cd2368628317d1934fc');
			expect(req.session.sessionId).to.equal('40120cd2368628317d1934fc');

			expect(new Date(req.session.iat)).to.be.a('date');
			expect(new Date(req.session.exp)).to.be.a('date');
		});
	});

	it('should return error if x-auth-token is not provided', function () {
		delete req.cookies['auth-token'];

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);
			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error if x-xsrf-token is not provided', function () {
		delete req.cookies['xsrf-token'];

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([403]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Forbidden Access' }
			]);
			expect(req.session).to.be.an('undefined');
		});
	});

	it('should return error if there was an error when verifying a token', function () {
		req.cookies['auth-token'] = 'something';

		middleware(req, res, (error) => {
			expect(error.status.getCall(0).args).to.deep.equal([401]);
			expect(error.json.getCall(0).args).to.deep.equal([
				{ message: 'Unauthorized Access' }
			]);
			expect(req.session).to.be.an('undefined');
		});
	});
});
