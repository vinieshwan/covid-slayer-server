const { expect } = require('chai');
const sinon = require('sinon');

const Server = require('../../lib/server');
// const { response } = require('./utils');
const {
	GameSettingsModel,
	SessionsModel,
	UsersModel
} = require('../../lib/models');
const {
	GameSettingsController,
	SessionsController,
	UsersController
} = require('../../lib/controllers');
const {
	expireSession,
	generateSession,
	generateTokens,
	verifySession,
	verifyTokens
} = require('../../lib/middlewares');
const {
	Login,
	Logout,
	Refresh,
	GetSettings,
	UpdateSettings,
	GetUser,
	SignupUser,
	UpdateUser
} = require('../../lib/routes');

describe('lib/server.js', function () {
	let server, models, controllers;

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = new Server(config);
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('#Constructor', function () {
		it('should instantiate config', function () {
			expect(server.config).to.deep.equal(config);
		});
	});

	describe('#start', function () {
		beforeEach(() => {
			sandbox.spy(server, 'loadDependencies');
			sandbox.spy(server, 'loadMiddlewares');
			sandbox.spy(server, 'loadRoutes');
			sandbox.spy(server, 'startListening');

			server.start();
		});

		it('should load all methods', function () {
			expect(server.loadDependencies.calledOnce).to.be.true;
			expect(server.loadMiddlewares.calledOnce).to.be.true;
			expect(server.loadMiddlewares.calledAfter(server.loadDependencies)).to.be
				.true;
			expect(server.loadRoutes.calledOnce).to.be.true;
			expect(server.loadRoutes.calledAfter(server.loadMiddlewares)).to.be.true;
			expect(server.startListening.calledOnce).to.be.true;
			expect(server.startListening.calledAfter(server.loadRoutes)).to.be.true;
		});
	});

	describe('#loadDependencies', function () {
		beforeEach(async () => {
			await server.loadDependencies();
		});

		it('should load all models', function () {
			expect(server.config.models.users).to.be.an.instanceOf(UsersModel);
			expect(server.config.models.sessions).to.be.an.instanceOf(SessionsModel);
			expect(server.config.models.gameSettings).to.be.an.instanceOf(
				GameSettingsModel
			);
		});

		it('should load all controllers', function () {
			expect(server.config.controllers.users).to.be.an.instanceOf(
				UsersController
			);
			expect(server.config.controllers.sessions).to.be.an.instanceOf(
				SessionsController
			);
			expect(server.config.controllers.gameSettings).to.be.an.instanceOf(
				GameSettingsController
			);
		});
	});

	describe('#loadMiddlewares', function () {
		it('should load all middlewares', function () {
			expect(server.config.middlewares.verifyTokens).to.deep.equal(
				config.middlewares.verifyTokens
			);
			expect(server.config.middlewares.verifySession).to.deep.equal(
				config.middlewares.verifySession
			);
			expect(server.config.middlewares.expireSession).to.deep.equal(
				config.middlewares.expireSession
			);
			expect(server.config.middlewares.generateSession).to.deep.equal(
				config.middlewares.generateSession
			);
			expect(server.config.middlewares.generateTokens).to.deep.equal(
				config.middlewares.generateTokens
			);
		});
	});

	describe('#startListening', function () {
		beforeEach(() => {
			sandbox.stub(server.app, 'use');
			sandbox.stub(server.app, 'listen');
			server.startListening();
		});

		it('should server start listening', function () {
			expect(server.app.use.calledOnce).to.be.true;
			expect(server.app.use.getCall(0).args.length).to.equal(1);
			expect(server.app.use.getCall(0).args[0]).to.be.a('function');
			expect(server.app.listen.calledOnce).to.be.true;
			expect(server.app.listen.getCall(0).args.length).to.equal(2);
			expect(server.app.listen.getCall(0).args[0]).to.equal(config.port);
			expect(server.app.listen.getCall(0).args[1]).to.be.a('function');
			expect(server.app.listen.calledAfter(server.app.use)).to.be.true;
		});
	});
});
