'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const {
	response,
	generateAuthToken,
	generateRefreshToken,
	verifyToken
} = require('../../../lib/utils/');
const {
	NotFoundError,
	ConflictError,
	UnresolvedError,
	BadRequestError,
	UnAuthorizedError
} = require('../../../lib/utils/errors');

describe('lib/utils/index.js', function () {
	let options, res;
	beforeEach(() => {
		options = {
			data: {
				ok: true,
				data: {
					user: {
						name: 'firstname lastname'
					}
				}
			}
		};

		res = {
			json: sinon.stub().returnsThis(),
			status: sinon.stub().returnsThis()
		};
	});

	describe('#response', function () {
		it('should return formatted success response', function () {
			const result = response(res, options);

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([200]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					...options,
					message: ''
				}
			]);
		});

		it('should return formatted response if message is provided', function () {
			const result = response(res, {
				message: 'Success'
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([200]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Success'
				}
			]);
		});

		it('should return formatted response if statusCode is provided', function () {
			const result = response(res, {
				statusCode: 401
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([401]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: ''
				}
			]);
		});

		it('should return formatted response if error provided is an instance of NotFoundError', function () {
			const result = response(res, {
				error: new NotFoundError('user')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([404]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Not found: user'
				}
			]);
		});

		it('should return formatted response if error provided is an instance of ConflictError', function () {
			const result = response(res, {
				error: new ConflictError('duplicate')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([409]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Conflict: duplicate'
				}
			]);
		});

		it('should return formatted response if error provided is an instance of UnresolvedError', function () {
			const result = response(res, {
				error: new UnresolvedError('not created')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([500]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Internal server error: not created'
				}
			]);
		});

		it('should return formatted response if error provided is an instance of BadRequestError', function () {
			const result = response(res, {
				error: new BadRequestError('bad')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([400]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Bad request: bad'
				}
			]);
		});

		it('should return formatted response if error provided is an instance of UnAuthorizedError', function () {
			const result = response(res, {
				error: new UnAuthorizedError('bad')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([401]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Unauthorized: bad'
				}
			]);
		});

		it('should return formatted response if error provided is not known', function () {
			const result = response(res, {
				error: new Error('something went wrong')
			});

			expect(result.status).to.be.a('Function');
			expect(result.status.calledOnce).to.be.true;
			expect(result.status.getCall(0).args).to.eql([500]);
			expect(result.json).to.be.a('Function');
			expect(result.json.calledOnce).to.be.true;
			expect(result.json.getCall(0).args).to.deep.equal([
				{
					message: 'Internal server error: something went wrong'
				}
			]);
		});
	});

	describe('#generateAuthToken', function () {
		it('should generate auth token', function () {
			const result = generateAuthToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: config.expiries
			});

			expect(result.token).to.be.a('string');
			expect(result.token.length).to.equal(228);
			expect(new Date(result.expiry)).to.be.a('date');
			expect(result.xsrfToken).to.be.a('string');
			expect(result.xsrfToken.length).to.equal(24);
		});
	});

	describe('#generateRefreshToken', function () {
		it('should generate auth token', function () {
			const result = generateRefreshToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: config.expiries
			});

			expect(result).to.be.a('string');
			expect(result.length).to.equal(228);
		});
	});

	describe('#verifyToken', function () {
		let oldAuth, auth;

		beforeEach(() => {
			oldAuth = generateAuthToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: {
					authToken: '2ms'
				}
			});

			auth = generateAuthToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: config.expiries
			});
		});

		it('should verify auth token', function () {
			const result = verifyToken(config.keys.jwt, auth.token, auth.xsrfToken);

			expect(result).to.be.an('object');
			expect(result.userId).to.equal('60120cd2368628317d1934fc');
			expect(result.sessionId).to.equal('40120cd2368628317d1934fc');

			expect(new Date(result.iat)).to.be.a('date');
			expect(new Date(result.exp)).to.be.a('date');
		});

		it('should verify even if xsrfToken is not provided', function () {
			const refreshToken = generateRefreshToken({
				userId: '60120cd2368628317d1934fc',
				sessionId: '40120cd2368628317d1934fc',
				keys: config.keys,
				expiries: config.expiries
			});

			const result = verifyToken(config.keys.jwt, refreshToken);

			expect(result).to.be.an('object');
			expect(result.userId).to.equal('60120cd2368628317d1934fc');
			expect(result.sessionId).to.equal('40120cd2368628317d1934fc');

			expect(new Date(result.iat)).to.be.a('date');
			expect(new Date(result.exp)).to.be.a('date');
		});

		it('should throw if token is not valid', function () {
			expect(() => {
				verifyToken(config.keys.jwt, 'something', auth.xsrfToken);
			}).to.throw('jwt malformed');
		});

		it('should throw if token expired', function () {
			expect(() => {
				verifyToken(config.keys.jwt, oldAuth.token, oldAuth.xsrfToken);
			}).to.throw('jwt expired');
		});
	});
});
