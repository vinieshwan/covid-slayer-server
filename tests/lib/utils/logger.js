'use strict';

const { expect } = require('chai');
const Logger = require('../../../lib/utils/logger');

describe('/lib/utils/logger.js', () => {
	let options, logger;

	beforeEach(() => {
		options = {
			label: 'Hello',
			message: 'This is a sample info message',
			data: {
				one: 'sample one'
			}
		};

		logger = new Logger();
	});

	it('should successfully log info', () => {
		const log = logger.info(options);

		expect(log).to.be.an('object');
		expect(logger.transports.length).to.equal(1);
	});

	it('should successfully log error', () => {
		const log = logger.error(options);

		expect(log).to.be.an('object');
		expect(logger.transports.length).to.equal(1);
	});

	it('should still log even if options is not provided', () => {
		const log = logger.info();

		expect(log).to.be.an('object');
		expect(logger.transports.length).to.equal(1);
	});
});
