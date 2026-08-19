'use strict';

/**
 * Sends a standardized success response
 * @param {object} res - Express response object
 * @param {object} data - Response data payload
 * @param {string} message - Human readable success message
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {object} pagination - Optional pagination metadata
 */
const successResponse = (res, data = {}, message = 'Success', statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {Array} errors - Array of error details
 * @param {number} statusCode - HTTP status code (default 500)
 */
const errorResponse = (res, message = 'An error occurred', errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

module.exports = { successResponse, errorResponse };
