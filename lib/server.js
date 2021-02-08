const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const Logger = require('./utils/logger');
const { GameSettingsModel, SessionsModel, UsersModel } = require('./models');
const {
	GameSettingsController,
	SessionsController,
	UsersController
} = require('./controllers');
const {
	expireSession,
	generateSession,
	generateTokens,
	verifySession,
	verifyTokens
} = require('./middlewares');
const {
	Login,
	Logout,
	Refresh,
	GetSettings,
	UpdateSettings,
	GetUser,
	SignupUser,
	UpdateUser,
	DownloadGameLog
} = require('./routes');

class Server {
	constructor(config) {
		this.app = app;
		this.config = config;
		this.config.logger = new Logger();
		this.config.models = {};
		this.config.controllers = {};
		this.config.middlewares = {};
	}

	start() {
		this.loadDependencies();
		this.loadMiddlewares();
		this.loadRoutes();
		this.startListening();
	}

	async loadDependencies() {
		this.app.use(cors());
		this.app.set('query parser', 'extended');
		this.app.use(bodyParser.json({ limit: '50mb' }));
		this.app.use(
			bodyParser.urlencoded({
				limit: '50mb',
				extended: true,
				parameterLimit: 50000
			})
		);

		app.use(cookieParser(this.config.keys.cookie));

		const { connectionUrl, poolSize, database } = this.config.mongodb;

		const mongodbClient = new MongoClient(connectionUrl, {
			poolSize,
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		try {
			await mongodbClient.connect();
		} catch (error) {
			this.config.logger.error({
				label: 'Server',
				message: error.message
			});
		}

		this.config.models.users = new UsersModel(mongodbClient, {
			database
		});
		this.config.models.sessions = new SessionsModel(mongodbClient, {
			database
		});
		this.config.models.gameSettings = new GameSettingsModel(mongodbClient, {
			database
		});

		this.config.controllers.users = new UsersController(this.config);
		this.config.controllers.sessions = new SessionsController(this.config);
		this.config.controllers.gameSettings = new GameSettingsController(
			this.config
		);
	}

	loadMiddlewares() {
		this.config.middlewares.verifyTokens = verifyTokens(this.config);
		this.config.middlewares.verifySession = verifySession(this.config);
		this.config.middlewares.expireSession = expireSession(this.config);
		this.config.middlewares.generateSession = generateSession(this.config);
		this.config.middlewares.generateTokens = generateTokens(this.config);
	}

	loadRoutes() {
		const login = new Login(this.app, this.config);
		login.setupRoute();

		const logout = new Logout(this.app, this.config);
		logout.setupRoute();

		const refresh = new Refresh(this.app, this.config);
		refresh.setupRoute();

		const getSettings = new GetSettings(this.app, this.config);
		getSettings.setupRoute();

		const updateSettings = new UpdateSettings(this.app, this.config);
		updateSettings.setupRoute();

		const downloadGameLog = new DownloadGameLog(this.app, this.config);
		downloadGameLog.setupRoute();

		const getUser = new GetUser(this.app, this.config);
		getUser.setupRoute();

		const signupUser = new SignupUser(this.app, this.config);
		signupUser.setupRoute();

		const updateUser = new UpdateUser(this.app, this.config);
		updateUser.setupRoute();
	}

	startListening() {
		const { port } = this.config;

		app.use(
			session({
				name: 'secure_session',
				secret: this.config.keys.cookie,
				resave: false,
				saveUninitialized: true,
				cookie: {
					path: '/',
					secure: true,
					//domain: ".herokuapp.com", REMOVE THIS HELPED ME (I dont use a domain anymore)
					httpOnly: true
				}
			})
		);

		this.app.listen(port, () => {
			console.log(`Listening to port: ${port}`);

			this.config.logger.info({
				label: 'Server',
				message: `Listening to port: ${port}`
			});
		});
	}
}

module.exports = Server;
