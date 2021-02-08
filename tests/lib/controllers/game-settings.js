'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const GameSettingsController = require('../../../lib/controllers/game-settings');
const { NotFoundError, UnresolvedError } = require('../../../lib/utils/errors');

describe('/lib/controllers/game-settings.js', () => {
	let gameSettingsController, playerName, userId, models, now, response;

	const sandbox = sinon.createSandbox();

	before(async () => {
		playerName = 'Player 1';
		userId = '60120cd2368628317d1934fb';

		models = await config.models();

		gameSettingsController = new GameSettingsController({
			models
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
		it('should contain game settings model as property', function () {
			expect(gameSettingsController.model).to.deep.equal(models.gameSettings);
		});

		it('should throw if model was not provided', function () {
			expect(() => {
				new GameSettingsController({});
			}).to.throw('Models were not provided');
		});

		it('should throw if game settings model was not provided', function () {
			expect(() => {
				new GameSettingsController({
					models: {}
				});
			}).to.throw('Game settings model was not provided');
		});
	});

	describe('#create', () => {
		beforeEach(() => {
			response = {
				ok: 1,
				n: 1
			};

			sandbox.stub(gameSettingsController.model, 'create').resolves(response);
		});

		it(`should return true if settings was successfully created`, async () => {
			expect(await gameSettingsController.create(userId, playerName)).to.be
				.true;

			expect(gameSettingsController.model.create.calledOnce).to.be.true;
			expect(
				gameSettingsController.model.create.getCall(0).args
			).to.deep.equal([userId, playerName]);
		});

		it('should throw if settings was not created', async () => {
			response.n = 0;

			let error;

			try {
				await gameSettingsController.create(userId, playerName);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(UnresolvedError);

			expect(gameSettingsController.model.create.calledOnce).to.be.true;
		});
	});

	describe('#get', () => {
		beforeEach(() => {
			response = {
				_id: '60120cd2368628317d1934fc',
				userId: '60120cd2368628317d1934fa',
				playerName: 'Player 1',
				createdOn: now,
				updatedOn: now,
				wins: 0,
				losses: 0,
				gamesPlayed: 0,
				gameTime: 60
			};
			sandbox.stub(gameSettingsController.model, 'get').resolves(response);
		});

		it(`should get a user's game settings`, async () => {
			const settings = await gameSettingsController.get(userId);

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal(response);

			expect(gameSettingsController.model.get.calledOnce).to.be.true;
			expect(gameSettingsController.model.get.getCall(0).args).to.deep.equal([
				userId,
				{
					fields: {
						userId: 1,
						wins: 1,
						losses: 1,
						gamesPlayed: 1,
						gameTime: 1,
						playerName: 1
					}
				}
			]);
		});

		it('should throw if settings returned null', async () => {
			gameSettingsController.model.get.resolves(null);

			let error;

			try {
				await gameSettingsController.get('60120cd2368628317d1934fc');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(NotFoundError);

			expect(gameSettingsController.model.get.calledOnce).to.be.true;
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
					userId,
					playerName: 'Custom player',
					wins: 1,
					losses: 0,
					gamesPlayed: 1,
					gameTime: 60
				}
			};
			sandbox.stub(gameSettingsController.model, 'update').resolves(response);
		});

		it(`should update a user's game settings`, async () => {
			const settings = await gameSettingsController.update(userId, {
				won: true
			});

			expect(settings).to.be.an('object');
			expect(settings).to.deep.equal(response.value);

			expect(gameSettingsController.model.update.calledOnce).to.be.true;
			expect(gameSettingsController.model.update.getCall(0).args).to.deep.equal(
				[
					userId,
					{
						won: true,
						fields: {
							userId: 1,
							wins: 1,
							losses: 1,
							gamesPlayed: 1,
							gameTime: 1,
							playerName: 1
						}
					}
				]
			);
		});

		it('should throw if no update made', async () => {
			response.value = null;

			let error;

			try {
				await gameSettingsController.update(userId, {
					lost: false,
					won: false
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
			expect(error).to.be.an.instanceOf(NotFoundError);

			expect(gameSettingsController.model.update.calledOnce).to.be.true;
		});
	});
});
