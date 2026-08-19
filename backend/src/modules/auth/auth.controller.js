'use strict';

const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');
const AuditLog = require('../../models/AuditLog.model');

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@hirate.in }
 *               password: { type: string, example: Admin@123456 }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // Audit log
  await AuditLog.create({
    userId: result.user.id,
    userName: result.user.name,
    userRole: result.user.role,
    action: 'LOGIN',
    resource: 'auth',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    description: `User logged in from ${req.ip}`
  });

  return successResponse(res, result, 'Login successful');
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, username, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               username: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Admin, HO, SPV, User] }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  await AuditLog.create({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'CREATE',
    resource: 'user',
    resourceId: user._id.toString(),
    newValue: { email: user.email, role: user.role },
    ip: req.ip,
    description: `Created user: ${user.email}`
  });

  return successResponse(res, user, 'User registered successfully', 201);
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, req.user, 'Profile retrieved successfully');
});

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change current user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);

  await AuditLog.create({
    userId: req.user._id,
    userName: req.user.name,
    action: 'UPDATE',
    resource: 'user',
    resourceId: req.user._id.toString(),
    description: 'Password changed',
    ip: req.ip
  });

  return successResponse(res, null, 'Password changed successfully');
});

module.exports = { login, register, getMe, changePassword };
