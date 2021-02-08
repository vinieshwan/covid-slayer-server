# Covid Slayer API

API for Covid Slayer app.

## Install instructions

Copy this repo by:

### `git clone https://github.com/vinieshwan/covid-slayer-server`

Install dependencies by:\

### `npm i`

To run tests:\

### `npm test`

Before running the server make to add these Environment variables:

| Variable             | Description                            |
| -------------------- | -------------------------------------- |
| PORT                 | Port                                   |
| DB_URL               | Database URL                           |
| DB_NAME              | Database name                          |
| KEY_SALT             | Salt for password encryption           |
| KEY_JWT              | JWT key for generating a token         |
| KEY_COOKIE           | Cookie key for secure cookie setting   |
| REFRESH_TOKEN_EXPIRY | JWT key for generating a refresh token |
| AUTH_TOKEN_EXPIRY    | Token expiry                           |
| COOKIE_PATH          | Cookie path                            |

Run by:\

### `npm start`

View the live app at:

### `https://covid-slayer-app.herokuapp.com/`
