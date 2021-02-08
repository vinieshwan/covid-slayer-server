'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const SessionsModel = require('../../../lib/models/sessions');
const { ObjectID } = require('mongodb');

describe('/lib/models/sessions.js', () => {
	let sessionsModel, userId, expiry, client, now;

	const sandbox = sinon.createSandbox();

	before(async () => {
		userId = '60120cd2368628317d1934fb';
		expiry = new Date(new Date().valueOf() + 120000);

		client = await config.client();

		sessionsModel = new SessionsModel(client, {
			database: config.db
		});

		await sessionsModel.collection.deleteMany({});
	});

	beforeEach(() => {
		now = new Date();

		sandbox.useFakeTimers(now);
	});

	afterEach(async () => {
		sandbox.restore();
		await sessionsModel.collection.deleteMany({});
	});

	describe('#create', () => {
		it(`should create user's session`, async () => {
			const created = await sessionsModel.create(userId, expiry);

			expect(created).to.be.an('object');
			expect(created.result).to.deep.equal({
				ok: 1,
				n: 1
			});

			expect(created.ops[0]._id).to.be.an.instanceOf(ObjectID);
			delete created.ops[0]._id;
			expect(created.ops).to.deep.equal([
				{
					userId: new ObjectID(userId),
					createdOn: now,
					updatedOn: now,
					expiresOn: expiry,
					expired: false
				}
			]);
			expect(created.insertedCount).to.equal(1);
		});

		it(`should return error if there was an error occurred while creating user's session`, async () => {
			sandbox
				.stub(sessionsModel.collection, 'insertOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await sessionsModel.create(userId, expiry);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#load', () => {
		let sesssionId;

		beforeEach(async () => {
			const result = await sessionsModel.create(userId, expiry);

			sesssionId = result.ops[0]._id;
		});

		it(`should get a user's session`, async () => {
			const session = await sessionsModel.load(userId, sesssionId);

			expect(session).to.be.an('object');

			expect(session).to.deep.equal({
				_id: sesssionId,
				expired: false,
				userId: new ObjectID(userId),
				createdOn: now,
				updatedOn: now,
				expiresOn: expiry
			});
		});

		it('should only retrieve the specified fields', async () => {
			const session = await sessionsModel.load(userId, sesssionId, {
				fields: {
					expiresOn: 1
				}
			});

			expect(session).to.be.an('object');

			expect(session).to.deep.equal({
				_id: sesssionId,
				expiresOn: expiry
			});
		});

		it('should return null if user does not exist', async () => {
			const session = await sessionsModel.load('60120cd2368628317d1934fc');

			expect(session).to.be.a('null');
		});

		it(`should return error if there was an error occurred while retrieving the user's game settings`, async () => {
			sandbox
				.stub(sessionsModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await sessionsModel.load(userId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#updateExpiry', () => {
		let sessionId, newExpiry;

		beforeEach(async () => {
			const result = await sessionsModel.create(userId, expiry);

			sessionId = result.ops[0]._id;

			newExpiry = new Date(expiry.valueOf() + 1000);
		});

		it(`should update a user's player name`, async () => {
			const session = await sessionsModel.updateExpiry(
				userId,
				sessionId,
				newExpiry
			);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: sessionId,
					expired: false,
					userId: new ObjectID(userId),
					createdOn: now,
					updatedOn: now,
					expiresOn: newExpiry
				}
			});
		});

		it('should not update if provided user id does not exist', async () => {
			const session = await sessionsModel.updateExpiry(
				'60120cd2368628317d1934fc',
				sessionId,
				newExpiry
			);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it('should not update if provided session id does not exist', async () => {
			const session = await sessionsModel.updateExpiry(
				userId,
				'60120cd2368628317d1934fc',
				newExpiry
			);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it(`should return error if there was an error occurred while updating a user's game settings`, async () => {
			sandbox
				.stub(sessionsModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			const user = await sessionsModel.collection.find().toArray();

			let error;

			try {
				await sessionsModel.updateExpiry(userId, sessionId, expiry);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#expire', () => {
		let sessionId;

		beforeEach(async () => {
			const result = await sessionsModel.create(userId, expiry);

			sessionId = result.ops[0]._id;
		});

		it(`should expire user's session`, async () => {
			const session = await sessionsModel.expire(userId, sessionId);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: sessionId,
					expired: true,
					userId: new ObjectID(userId),
					createdOn: now,
					updatedOn: now,
					expiresOn: expiry
				}
			});
		});

		it('should not expire session if provided user id does not exist', async () => {
			const session = await sessionsModel.updateExpiry(
				'60120cd2368628317d1934fc',
				sessionId
			);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it('should not expire session if provided session id does not exist', async () => {
			const session = await sessionsModel.updateExpiry(
				userId,
				'60120cd2368628317d1934fc'
			);

			expect(session).to.be.an('object');
			expect(session).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it(`should return error if there was an error occurred while updating a user's game settings`, async () => {
			sandbox
				.stub(sessionsModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			const user = await sessionsModel.collection.find().toArray();

			let error;

			try {
				await sessionsModel.updateExpiry(userId, sessionId, expiry);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
