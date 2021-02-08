'use strict';

/**
 * Conflict errors
 */
class ConflictError extends Error {
	/**
	 * @param {String} message - Error message
	 */
	constructor(message) {
		super(message);

		this.name = 'ConflictError';

		Error.captureStackTrace(this, ConflictError);
	}
}

/**
 * Not found errors
 */
class NotFoundError extends Error {
	/**
	 * @param {String} message - Error message
	 */
	constructor(message) {
		super(message);

		this.name = 'NotFoundError';

		Error.captureStackTrace(this, NotFoundError);
	}
}

/**
 * Unresolved errors
 */
class UnresolvedError extends Error {
	/**
	 * @param {String} message - Error message
	 */
	constructor(message) {
		super(message);

		this.name = 'UnresolvedError';

		Error.captureStackTrace(this, UnresolvedError);
	}
}

/**
 * Bad request errors
 */
class BadRequestError extends Error {
	/**
	 * @param {String} message - Error message
	 */
	constructor(message) {
		super(message);

		this.name = 'BadRequestError';

		Error.captureStackTrace(this, BadRequestError);
	}
}

/**
 * Unauthorized errors
 */
class UnAuthorizedError extends Error {
	/**
	 * @param {String} message - Error message
	 */
	constructor(message) {
		super(message);

		this.name = 'UnAuthorizedError';

		Error.captureStackTrace(this, UnAuthorizedError);
	}
}

module.exports = {
	ConflictError: ConflictError,
	NotFoundError: NotFoundError,
	UnresolvedError: UnresolvedError,
	BadRequestError: BadRequestError,
	UnAuthorizedError: UnAuthorizedError
};
