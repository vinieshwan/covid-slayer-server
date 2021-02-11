'use strict';

const path = require('path');
const {
	PORT,
	DB_URL,
	DB_NAME,
	KEY_SALT,
	KEY_JWT,
	KEY_COOKIE,
	REFRESH_TOKEN_EXPIRY,
	AUTH_TOKEN_EXPIRY,
	COOKIE_PATH,
	NODE_ENV
} = process.env;

module.exports = {
	port: parseInt(PORT, 10) || 4000,
	rootPath: path.join(__dirname),
	mongodb: {
		connectionUrl: DB_URL,
		poolSize: 10,
		database: DB_NAME
	},
	keys: {
		salt: parseInt(KEY_SALT, 10),
		jwt: KEY_JWT,
		cookie: KEY_COOKIE
	},
	options: {
		cookies: {
			httpOnly: true,
			secure: NODE_ENV === 'production',
			path: COOKIE_PATH,
			signed: true
		}
	},
	expiries: {
		refreshToken: REFRESH_TOKEN_EXPIRY,
		authToken: AUTH_TOKEN_EXPIRY
	}
};
