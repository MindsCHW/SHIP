'use strict';

const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const logger = require('../../config/logger');

/**
 * Generates a JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
};

/**
 * Authenticates user with email and password
 * Returns user object and JWT token
 */
const login = async (email, password) => {
  // Find user and include passwordHash (excluded by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account has been deactivated. Contact administrator.'), {
      statusCode: 403
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);
  logger.info(`User logged in: ${user.email} (${user.role})`);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      roadAssignment: user.roadAssignment,
      designation: user.designation,
      lastLogin: user.lastLogin
    }
  };
};

/**
 * Registers a new user (Admin only action)
 */
const register = async (userData) => {
  const { name, email, username, password, role, ...rest } = userData;

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existing) {
    const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
    throw Object.assign(new Error(`${field} already exists`), { statusCode: 409 });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    username,
    passwordHash: password, // pre-save hook will hash this
    role: role || 'User',
    ...rest
  });

  logger.info(`New user registered: ${user.email} (${user.role})`);
  return user;
};

/**
 * Changes user password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }

  user.passwordHash = newPassword; // pre-save hook will rehash
  await user.save();

  return true;
};

module.exports = { login, register, generateToken, changePassword };
