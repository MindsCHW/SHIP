'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Extracts and validates pagination parameters from query string
 * @param {object} query - Express req.query object
 * @returns {{ page, limit, skip, totalPages }} Pagination metadata
 */
const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds pagination metadata for the response
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1
});

module.exports = { getPagination, buildPaginationMeta };
