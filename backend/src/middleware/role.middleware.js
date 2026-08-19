'use strict';

const { errorResponse } = require('../utils/response.util');

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('Admin', 'HO')
 * @param {...string} roles - Allowed role names
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', [], 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        [],
        403
      );
    }

    next();
  };
};

module.exports = { requireRole };
