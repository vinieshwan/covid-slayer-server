# Covid Slayer API

API for Covid Slayer app.

## Run instructions

Copy this repo:

### `git clone https://github.com/vinieshwan/covid-slayer-server`

Run the build:

### `docker-compose build`

Run the app:

### `docker-compose up`

## Environment variables

\*\* You may want to update the environment variables under .env.
| Variable | Description |
| -------------------- | -------------------------------------- |
| PORT | Port |
| DB_URL | Database URL |
| DB_NAME | Database name |
| KEY_SALT | Salt for password encryption |
| KEY_JWT | JWT key for generating a token |
| KEY_COOKIE | Cookie key for secure cookie setting |
| REFRESH_TOKEN_EXPIRY | JWT key for generating a refresh token |
| AUTH_TOKEN_EXPIRY | Token expiry |
| COOKIE_PATH | Cookie path |

View the app in your browser:

### `https://localhost:3000/`

If you want to run the test:

### `npm test`
