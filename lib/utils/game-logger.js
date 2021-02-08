'use strict';

const winston = require('winston');

const { format, transports, createLogger } = winston;
const { timestamp, splat, simple, combine, printf } = format;

/** Game logger */
class GameLogger {
	/**
	 * @param {String} filename - filename
	 */
	constructor(filename) {
		const logger = createLogger({
			transports: [
				new transports.File({
					filename: `./lib/config/game-logs/${filename}.log`,
					format: combine(
						timestamp(),
						splat(),
						simple(),
						printf((log) => {
							return `Date: ${log.timestamp} ${log.message}`;
						})
					)
				})
			]
		});

		return logger;
	}
}

module.exports = GameLogger;
