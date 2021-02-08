'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const UsersModel = require('../../../lib/models/users');

describe('/lib/models/users.js', () => {
	let usersModel, userInfo, client, now;

	const sandbox = sinon.createSandbox();

	before(async () => {
		userInfo = {
			password: 'password',
			email: 'username@email.com',
			name: 'firstname lastname'
		};

		client = await config.client();

		usersModel = new UsersModel(client, {
			database: config.db
		});

		await usersModel.collection.deleteMany({});
	});

	beforeEach(() => {
		now = new Date();

		sandbox.useFakeTimers(now);
	});

	afterEach(async () => {
		sandbox.restore();
		await usersModel.collection.deleteMany({});
	});

	describe('#create', () => {
		it('should create a user', async () => {
			const created = await usersModel.create(userInfo);

			expect(created).to.be.an('object');
			expect(created.result).to.deep.equal({
				ok: 1,
				n: 1
			});
			expect(created.ops).to.deep.equal([userInfo]);
			expect(created.insertedCount).to.equal(1);
		});

		it('should return error if there was an error occurred while creating a user', async () => {
			sandbox
				.stub(usersModel.collection, 'insertOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await usersModel.create(userInfo);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#get', () => {
		beforeEach(async () => {
			await usersModel.create(userInfo);
		});

		it(`should get a user's information`, async () => {
			const user = await usersModel.collection.find().toArray();

			const userDetails = await usersModel.get({
				userId: user[0]._id
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal(user[0]);
		});

		it('should only retrieve the specified fields', async () => {
			const user = await usersModel.collection.find().toArray();

			const userDetails = await usersModel.get({
				email: user[0].email,
				fields: {
					name: 1
				}
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal({
				_id: user[0]._id,
				name: user[0].name
			});
		});

		it('should return null if user does not exist', async () => {
			const userDetails = await usersModel.get({
				userId: '60120cd2368628317d1934fb'
			});

			expect(userDetails).to.be.a('null');
		});
	});

	describe('#update', () => {
		beforeEach(async () => {
			await usersModel.create(userInfo);
		});

		it(`should update a user's information`, async () => {
			const user = await usersModel.collection.find().toArray();

			const userDetails = await usersModel.update(user[0]._id, {
				name: 'new name'
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					...user[0],
					name: 'new name',
					createdOn: now,
					updatedOn: now
				}
			});
		});

		it(`should update a user info and only retrieve the provided fields`, async () => {
			const user = await usersModel.collection.find().toArray();

			const userDetails = await usersModel.update(user[0]._id, {
				name: 'new name',
				fields: {
					name: 1
				}
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: user[0]._id,
					name: 'new name'
				}
			});
		});

		it('should not update if provided user id does not exist', async () => {
			const userDetails = await usersModel.update('60120cd2368628317d1934fb', {
				name: 'new name'
			});

			expect(userDetails).to.be.an('object');
			expect(userDetails).to.be.an('object');
			expect(userDetails).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it('should return error if there was an error occurred while updating a user', async () => {
			sandbox
				.stub(usersModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			const user = await usersModel.collection.find().toArray();

			let error;

			try {
				await usersModel.update(user[0]._id, {
					name: 'new name'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
