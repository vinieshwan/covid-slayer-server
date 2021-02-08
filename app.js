'use strict';

const config = require('./lib/config');
const Server = require('./lib/server');
const Logger = require('./lib/utils/logger');
const logger = new Logger();
async function exceptionHandler(name, error) {
	logger.error({
		label: 'Startup',
		message: name
	});
	process.exit(1);
}

process.on(
	'uncaughtException',
	exceptionHandler.bind(null, 'uncaughtException')
);
process.on(
	'unhandledRejection',
	exceptionHandler.bind(null, 'unhandledRejection')
);

const server = new Server(config);

server.start();
