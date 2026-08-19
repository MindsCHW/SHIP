'use strict';

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response.util');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler.util');

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Access denied. No token provided.', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to ensure account is still active
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return errorResponse(res, 'User not found. Token invalid.', [], 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated. Contact administrator.', [], 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', [], 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', [], 401);
    }
    throw err;
  }
});

module.exports = { authenticate };
