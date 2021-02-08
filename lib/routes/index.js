module.exports = {
	Login: require('./auth/login'),
	Logout: require('./auth/logout'),
	Refresh: require('./auth/refresh'),
	GetSettings: require('./game/get-settings'),
	UpdateSettings: require('./game/update-settings'),
	DownloadGameLog: require('./game/download-game-log'),
	GetUser: require('./users/get'),
	SignupUser: require('./users/signup'),
	UpdateUser: require('./users/update')
};
