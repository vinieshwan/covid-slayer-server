'use strict';

const { ObjectID } = require('mongodb');

/** Model for game settings management */
class GameSettingsModel {
	constructor(client, options) {
		const db = client.db(options.database);

		this.collection = db.collection('gameSettings');
	}

	async createIndexes() {
		await this.collection.createIndex(
			{ userId: 1 },
			{
				unique: true
			}
		);
	}

	/**
	 * Setup game settings for a certain user
	 * @param {string} userId - User id
	 * @param {string} playerName - User id
	 * @returns {Promise<object>} - Db operation response
	 */
	create(userId, playerName) {
		return this.collection.insertOne({
			userId: new ObjectID(userId),
			createdOn: new Date(),
			updatedOn: new Date(),
			wins: 0,
			losses: 0,
			gamesPlayed: 0,
			gameTime: 60,
			playerName
		});
	}

	/**
	 * Get a user's game settings
	 * @param {string} userId - User Id
	 * @param {object} [options={}] - Options
	 * @param {object} [options.fields] - Fields to retrieve
	 * @returns {Promise<object>} - Db operation response
	 */
	get(userId, options = {}) {
		const queryOptions = {};

		if (options.fields !== undefined) {
			queryOptions.projection = options.fields;
		}

		return this.collection.findOne(
			{
				userId: new ObjectID(userId)
			},
			queryOptions
		);
	}

	/**
	 * Update a user's game settings
	 * @param {string} userId - User Id
	 * @param {object} [settings={}] - Game settings
	 * @param {string} [settings.playerName] - Player name
	 * @param {number} [settings.gameTime] - Game time
	 * @param {boolean} [settings.won] - Flag if the player won in the recent game
	 * @param {boolean} [settings.lost] - Flag if the player lost in the recent game
	 * @param {object} [settings.fields] - Fields to retrieve
	 * @returns {Promise<object>} - Db operation response
	 */
	update(userId, settings = {}) {
		let hasUpdate = false;

		const options = {
			returnOriginal: false
		};

		if (settings.fields !== undefined) {
			options.projection = settings.fields;
		}

		const updates = {
			$set: {
				updatedOn: new Date()
			}
		};

		if (settings.playerName !== undefined) {
			updates.$set.playerName = settings.playerName;

			hasUpdate = true;
		}

		if (settings.gameTime !== undefined) {
			updates.$set.gameTime = settings.gameTime;

			hasUpdate = true;
		}

		if (settings.won || settings.lost) {
			updates.$inc = {
				gamesPlayed: 1
			};

			if (settings.won) {
				updates.$inc.wins = 1;
			}

			if (settings.lost) {
				updates.$inc.losses = 1;
			}

			hasUpdate = true;
		}

		if (!hasUpdate) {
			throw new Error('No update provided!');
		}

		return this.collection.findOneAndUpdate(
			{
				userId: new ObjectID(userId)
			},
			updates,
			options
		);
	}
}

module.exports = GameSettingsModel;
