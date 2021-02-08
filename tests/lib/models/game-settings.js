'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const GameSettingsModel = require('../../../lib/models/game-settings');
const { ObjectID } = require('mongodb');

describe('/lib/models/game-settings.js', () => {
	let gameSettingsModel, playerName, userId, client, now;

	const sandbox = sinon.createSandbox();

	before(async () => {
		playerName = 'Player 1';
		userId = '60120cd2368628317d1934fb';

		client = await config.client();

		gameSettingsModel = new GameSettingsModel(client, {
			database: config.db
		});

		await gameSettingsModel.collection.deleteMany({});
	});

	beforeEach(() => {
		now = new Date();

		sandbox.useFakeTimers(now);
	});

	afterEach(async () => {
		sandbox.restore();
		await gameSettingsModel.collection.deleteMany({});
	});

	describe('#create', () => {
		it(`should setup user's game settings`, async () => {
			const created = await gameSettingsModel.create(userId, playerName);

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
					playerName,
					createdOn: now,
					updatedOn: now,
					wins: 0,
					losses: 0,
					gamesPlayed: 0,
					gameTime: 60
				}
			]);
			expect(created.insertedCount).to.equal(1);
		});

		it(`should return error if there was an error occurred while setting up the user's game settings`, async () => {
			sandbox
				.stub(gameSettingsModel.collection, 'insertOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await gameSettingsModel.create(userId, playerName);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#get', () => {
		beforeEach(async () => {
			await gameSettingsModel.create(userId, playerName);
		});

		it(`should get a user's game settings`, async () => {
			const settings = await gameSettingsModel.get(userId);

			expect(settings).to.be.an('object');
			expect(settings._id).to.be.an.instanceOf(ObjectID);
			delete settings._id;
			expect(settings).to.deep.equal({
				userId: new ObjectID(userId),
				playerName,
				createdOn: now,
				updatedOn: now,
				wins: 0,
				losses: 0,
				gamesPlayed: 0,
				gameTime: 60
			});
		});

		it('should only retrieved the specified fields', async () => {
			const settings = await gameSettingsModel.get(userId, {
				fields: {
					playerName: 1
				}
			});

			expect(settings).to.be.an('object');
			expect(settings._id).to.be.an.instanceOf(ObjectID);
			delete settings._id;
			expect(settings).to.deep.equal({
				playerName
			});
		});

		it('should return null if user does not exist', async () => {
			const settings = await gameSettingsModel.get('60120cd2368628317d1934fc');

			expect(settings).to.be.a('null');
		});

		it(`should return error if there was an error occurred while retrieving the user's game settings`, async () => {
			sandbox
				.stub(gameSettingsModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await gameSettingsModel.get(userId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#update', () => {
		let gameSettings, gameId;

		beforeEach(async () => {
			const result = await gameSettingsModel.create(userId, playerName);

			gameId = result.ops[0]._id;

			gameSettings = {
				playerName: 'Custom player'
			};
		});

		it(`should update a user's player name`, async () => {
			const settings = await gameSettingsModel.update(userId, {
				playerName: 'Custom player'
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: gameId,
					userId: new ObjectID(userId),
					playerName: 'Custom player',
					createdOn: now,
					updatedOn: now,
					wins: 0,
					losses: 0,
					gamesPlayed: 0,
					gameTime: 60
				}
			});
		});

		it(`should update a user's player name and only retrieve the provided fields`, async () => {
			const settings = await gameSettingsModel.update(userId, {
				playerName: 'Custom player',
				fields: {
					playerName: 1
				}
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: gameId,
					playerName: 'Custom player'
				}
			});
		});

		it(`should update a user's gameTime if provided`, async () => {
			const settings = await gameSettingsModel.update(userId, {
				gameTime: 120
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: gameId,
					userId: new ObjectID(userId),
					playerName,
					createdOn: now,
					updatedOn: now,
					wins: 0,
					losses: 0,
					gamesPlayed: 0,
					gameTime: 120
				}
			});
		});

		it(`should increment user's gamesPlayed and wins if user won during the last game`, async () => {
			const settings = await gameSettingsModel.update(userId, {
				won: true
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: gameId,
					userId: new ObjectID(userId),
					playerName,
					createdOn: now,
					updatedOn: now,
					wins: 1,
					losses: 0,
					gamesPlayed: 1,
					gameTime: 60
				}
			});
		});

		it(`should increment user's gamesPlayed and losses if user lost during the last game`, async () => {
			const settings = await gameSettingsModel.update(userId, {
				lost: true
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 1,
					updatedExisting: true
				},
				value: {
					_id: gameId,
					userId: new ObjectID(userId),
					playerName,
					createdOn: now,
					updatedOn: now,
					wins: 0,
					losses: 1,
					gamesPlayed: 1,
					gameTime: 60
				}
			});
		});

		it('should not update if provided user id does not exist', async () => {
			const settings = await gameSettingsModel.update(
				'60120cd2368628317d1934fc',
				gameSettings
			);

			expect(settings).to.be.an('object');
			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal({
				ok: 1,
				lastErrorObject: {
					n: 0,
					updatedExisting: false
				},
				value: null
			});
		});

		it(`should throw if both lost and won was set to false and no other updates were provided`, async () => {
			let error;

			try {
				await gameSettingsModel.update(userId, {
					lost: false,
					won: false
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if no updates provided', async () => {
			let error;

			try {
				await gameSettingsModel.update(userId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it(`should return error if there was an error occurred while updating a user's game settings`, async () => {
			sandbox
				.stub(gameSettingsModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			const user = await gameSettingsModel.collection.find().toArray();

			let error;

			try {
				await gameSettingsModel.update(userId, gameSettings);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
