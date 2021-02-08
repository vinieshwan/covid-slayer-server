'use strict';

const { expect } = require('chai');

const {
	ConflictError,
	NotFoundError,
	UnresolvedError,
	BadRequestError,
	UnAuthorizedError
} = require('../../../lib/utils/errors');

describe('lib/utils/errors.js', function () {
	let error;

	describe('#ConflictError', function () {
		beforeEach(function () {
			error = new ConflictError('duplicate user');
		});

		it('should set error name and message', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.name).to.be.equal('ConflictError');
			expect(error.message).to.equal('duplicate user');
		});
	});

	describe('#NotFoundError', function () {
		beforeEach(function () {
			error = new NotFoundError('user');
		});

		it('should set error name and message', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.name).to.be.equal('NotFoundError');
			expect(error.message).to.equal('user');
		});
	});

	describe('#UnresolvedError', function () {
		beforeEach(function () {
			error = new UnresolvedError('not created');
		});

		it('should set error name and message', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.name).to.be.equal('UnresolvedError');
			expect(error.message).to.equal('not created');
		});
	});

	describe('#BadRequestError', function () {
		beforeEach(function () {
			error = new BadRequestError('bad');
		});

		it('should set error name and message', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.name).to.be.equal('BadRequestError');
			expect(error.message).to.equal('bad');
		});
	});

	describe('#UnAuthorizedError', function () {
		beforeEach(function () {
			error = new UnAuthorizedError('bad');
		});

		it('should set error name and message', function () {
			expect(error).to.be.an.instanceOf(Error);
			expect(error.name).to.be.equal('UnAuthorizedError');
			expect(error.message).to.equal('bad');
		});
	});
});
