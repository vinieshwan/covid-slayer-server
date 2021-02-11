'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const sinon = require('sinon');
const GameSettingsModel = require('../lib/models/game-settings');
const UsersModel = require('../lib/models/users');
const SessionsModel = require('../lib/models/sessions');

const GameSettingsController = require('../lib/controllers/game-settings');
const UsersController = require('../lib/controllers/users');
const SessionsController = require('../lib/controllers/sessions');

const verifyTokensMiddleware = require('../lib/middlewares/verify-tokens');
const verifySessionMiddleware = require('../lib/middlewares/verify-session');
const expireSessionMiddleware = require('../lib/middlewares/expire-session');
const generateSessionMiddleware = require('../lib/middlewares/generate-session');
const generateTokensMiddleware = require('../lib/middlewares/generate-tokens');
const Logger = require('../lib/utils/logger');

const logger = new Logger();

const config = {
	port: 8000,
	rootPath: path.join(__dirname),
	mongodb: {
		connectionUrl:
			'mongodb://root:root@localhost:27017/covid-slayer?retryWrites=true&w=majority',
		poolSize: 10,
		database: 'covid-slayer'
	},
	keys: {
		salt: 15,
		jwt: 'jwt-secret',
		cookie: 'cookie-secret'
	},
	options: {
		cookies: {
			httpOnly: true,
			secure: false,
			signed: true
		}
	},
	expiries: {
		refreshToken: '2d',
		authToken: '4h'
	}
};

const app = express();
app.set('query parser', 'extended');
app.use(express.json());
app.use(cookieParser(config.keys.cookie));

async function dbConnect() {
	const mongodbClient = new MongoClient(config.mongodb.connectionUrl, {
		poolSize: config.mongodb.poolSize,
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	try {
		await mongodbClient.connect();
	} catch (error) {
		return error;
	}

	return mongodbClient;
}

function mockServer() {
	return http.createServer(app);
}

async function getModels() {
	const client = await dbConnect();
	const database = config.mongodb.database;

	return {
		users: new UsersModel(client, {
			database
		}),
		sessions: new SessionsModel(client, {
			database
		}),
		gameSettings: new GameSettingsModel(client, {
			database
		})
	};
}

async function getControllers() {
	const models = await getModels();

	return {
		users: new UsersController({
			models,
			keys: config.keys
		}),
		sessions: new SessionsController({
			models,
			expiries: config.expiries
		}),
		gameSettings: new GameSettingsController({ models })
	};
}

async function getMiddlewares() {
	const controllers = await getControllers();

	sinon.stub(controllers.sessions, 'load').resolves({
		sessionId: '40120cd2368628317d1934fc',
		expiry: new Date()
	});

	sinon
		.stub(controllers.sessions, 'create')
		.onFirstCall()
		.resolves({
			sessionId: '40120cd2368628317d1934fc',
			expiry: new Date()
		})
		.onSecondCall()
		.rejects(new Error('error'));

	sinon
		.stub(controllers.sessions, 'expireSession')
		.onFirstCall()
		.resolves(true)
		.onSecondCall()
		.rejects(new Error('error'));

	return {
		verifyTokens: verifyTokensMiddleware({ keys: config.keys, logger }),
		verifySession: verifySessionMiddleware({
			controllers: {
				sessions: controllers.sessions
			},
			logger
		}),
		expireSession: expireSessionMiddleware({
			options: config.options,
			controllers: {
				sessions: controllers.sessions
			},
			logger
		}),
		generateSession: generateSessionMiddleware({
			controllers: {
				sessions: controllers.sessions
			},
			logger
		}),
		generateTokens: generateTokensMiddleware({
			options: config.options,
			keys: config.keys,
			expiries: config.expiries,
			controllers: {
				sessions: controllers.sessions
			},
			logger
		})
	};
}

global.config = {
	rootPath: config.rootPath,
	client: dbConnect,
	db: config.mongodb.database,
	models: getModels,
	controllers: getControllers,
	server: mockServer(),
	app,
	port: config.port,
	keys: config.keys,
	expiries: config.expiries,
	options: config.options,
	middlewares: getMiddlewares,
	logger,
	mongodb: config.mongodb
};
