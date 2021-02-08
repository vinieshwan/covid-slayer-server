'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const UsersController = require('../../../lib/controllers/users');
const {
	NotFoundError,
	UnresolvedError,
	BadRequestError,
	UnAuthorizedError
} = require('../../../lib/utils/errors');

describe('/lib/controllers/users.js', () => {
	let usersController, userInfo, models, now, response;

	const sandbox = sinon.createSandbox();

	before(async () => {
		userInfo = {
			password: 'password',
			email: 'username@email.com',
			name: 'firstname lastname'
		};

		models = await config.models();

		usersController = new UsersController({
			models,
			keys: config.keys
		});
	});

	beforeEach(() => {
		now = new Date();

		sandbox.useFakeTimers(now);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should contain users model as property', function () {
			expect(usersController.model).to.deep.equal(models.users);
		});

		it('should throw if model was not provided', function () {
			expect(() => {
				new UsersController({});
			}).to.throw('Models were not provided');
		});

		it('should throw if model was not provided', function () {
			expect(() => {
				new UsersController({ models: {} });
			}).to.throw('Users model was not provided');
		});

		it('should throw if keys was not provided', function () {
			expect(() => {
				new UsersController({ models });
			}).to.throw('Keys were not provided');
		});
	});

	describe('#create', () => {
		beforeEach(() => {
			response = {
				ok: 1,
				n: 1,
				ops: [
					{
						_id: '60120cd2368628317d1934fc'
					}
				]
			};

			sandbox.stub(usersController.model, 'create').resolves(response);
		});

		it('should return true if user was successfully created', async () => {
			expect(await usersController.create(userInfo)).to.be.equal(
				'60120cd2368628317d1934fc'
			);

			expect(usersController.model.create.calledOnce).to.be.true;

			expect(usersController.model.create.getCall(0).args).to.deep.equal([
				userInfo
			]);
		});

		it('should throw if user was not created', async () => {
			response.n = 0;

			let error;

			try {
				await usersController.create(userInfo);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(usersController.model.create.calledOnce).to.be.true;
		});
	});

	describe('#get', () => {
		beforeEach(() => {
			response = {
				_id: '60120cd2368628317d1934fc',
				email: 'username@email.com',
				name: 'firstname lastname'
			};

			sandbox.stub(usersController.model, 'get').resolves(response);
		});

		it(`should get a user's information`, async () => {
			const userDetails = await usersController.get(response._id);

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal(response);

			expect(usersController.model.get.calledOnce).to.be.true;
			expect(usersController.model.get.getCall(0).args).to.deep.equal([
				{
					userId: response._id,
					fields: {
						email: 1,
						name: 1
					}
				}
			]);
		});

		it('should throw if user details returned null', async () => {
			usersController.model.get.resolves(null);

			let error;

			try {
				await usersController.get('60120cd2368628317d1934fc');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(NotFoundError);

			expect(usersController.model.get.calledOnce).to.be.true;
		});
	});

	describe('#validate', () => {
		beforeEach(() => {
			response = {
				_id: '60120cd2368628317d1934fc',
				email: 'username@email.com',
				password:
					'$2b$10$5dBW5jnFkZZ7Xl6zchDUDu3Fbf4yQwRYrFyPExldCa8j.R/6Kay5W',
				name: 'name'
			};

			sandbox.stub(usersController.model, 'get').resolves(response);
		});

		it('should validate login information', async () => {
			expect(
				await usersController.validate('username@email.com', 'password')
			).to.deep.equal({
				name: 'name',
				userId: response._id
			});

			expect(usersController.model.get.calledOnce).to.be.true;
			expect(usersController.model.get.getCall(0).args).to.deep.equal([
				{
					email: 'username@email.com',
					fields: {
						email: 1,
						password: 1,
						name: 1
					}
				}
			]);
		});

		it('should throw if password is invalid', async () => {
			let error;

			try {
				await usersController.validate('username1@email.com', 'password1');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnAuthorizedError);

			expect(usersController.model.get.calledOnce).to.be.true;
		});

		it('should throw if email was not found', async () => {
			usersController.model.get.resolves(null);

			let error;

			try {
				await usersController.validate('username1@email.com', 'password');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(BadRequestError);

			expect(usersController.model.get.calledOnce).to.be.true;
		});
	});

	describe('#update', () => {
		beforeEach(() => {
			response = {
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: '60120cd2368628317d1934fc',
					email: 'username@email.com',
					name: 'firstname lastname'
				}
			};

			sandbox.stub(usersController.model, 'update').resolves(response);
		});

		it(`should update a user's information`, async () => {
			const userDetails = await usersController.update(response.value._id, {
				name: 'new name'
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal(response.value);

			expect(usersController.model.update.calledOnce).to.be.true;
			expect(usersController.model.update.getCall(0).args).to.deep.equal([
				response.value._id,
				{
					name: 'new name',
					fields: {
						name: 1,
						email: 1
					}
				}
			]);
		});

		it('should throw if no update made', async () => {
			response.value = null;

			let error;

			try {
				await usersController.update('60120cd2368628317d1934fc', {
					name: 'new name'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(NotFoundError);

			expect(usersController.model.update.calledOnce).to.be.true;
		});
	});
});
