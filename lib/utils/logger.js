'use strict';

const winston = require('winston');

const { format, transports, createLogger } = winston;
const { timestamp, splat, simple, combine, printf } = format;

/** Info and error logger */
class Logger {
	constructor() {
		const logger = createLogger({
			transports: [
				new transports.File({
					filename: 'output.log',
					format: combine(
						timestamp(),
						splat(),
						simple(),
						printf((log) => {
							return `${log.timestamp} [${log.level}]: ${log.label} - ${
								log.message
							} - ${JSON.stringify(log.data)}`;
						})
					)
				})
			]
		});

		return logger;
	}
}

module.exports = Logger;
