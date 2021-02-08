'use strict';

const { NotFoundError, UnresolvedError } = require('../utils/errors');

/** Controller for game settings management */
class GameSettingsController {
	constructor(config) {
		if (config.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (config.models.gameSettings === undefined) {
			throw new Error('Game settings model was not provided');
		}

		this.model = config.models.gameSettings;
	}

	/**
	 * Setup game settings for a certain user
	 * @param {string} userId - User id
	 * @param {string} playerName - User id
	 * @returns {Promise<boolen>} - Flag if settings was successfully created
	 */
	async create(userId, playerName) {
		const result = await this.model.create(userId, playerName);

		if (result.n === 0) {
			throw new UnresolvedError('user not created');
		}

		return true;
	}

	/**
	 * Get a user's game settings
	 * @param {string} userId - User Id
	 * @returns {Promise<object>} - Game settings
	 */
	async get(userId) {
		const gameSettings = await this.model.get(userId, {
			fields: {
				userId: 1,
				wins: 1,
				losses: 1,
				gamesPlayed: 1,
				gameTime: 1,
				playerName: 1
			}
		});

		if (gameSettings === null) {
			throw new NotFoundError('user');
		}

		return gameSettings;
	}

	/**
	 * Update a user's game settings
	 * @param {string} userId - User Id
	 * @param {object} [settings={}] - Game settings
	 * @param {string} [settings.playerName] - Player name
	 * @param {number} [settings.gameTime] - Game time
	 * @param {boolean} [settings.won] - Flag if the player won in the recent game
	 * @param {boolean} [settings.lost] - Flag if the player lost in the recent game
	 * @returns {Promise<object>} - Updated game settings
	 */
	async update(userId, settings) {
		settings.fields = {
			userId: 1,
			wins: 1,
			losses: 1,
			gamesPlayed: 1,
			gameTime: 1,
			playerName: 1
		};

		const result = await this.model.update(userId, settings);

		if (result.value === null) {
			throw new NotFoundError('user');
		}

		return result.value;
	}
}

module.exports = GameSettingsController;
