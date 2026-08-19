'use strict';

/**
 * Wraps async route handlers to automatically pass errors to next()
 * Eliminates the need for try-catch in every controller
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
