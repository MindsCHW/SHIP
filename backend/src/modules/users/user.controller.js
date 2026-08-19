'use strict';

const userService = require('./user.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (with filters)
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [Admin, HO, SPV, User] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: User list
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  return successResponse(res, result.users, 'Users retrieved successfully', 200, result.pagination);
});

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 *     responses:
 *       200:
 *         description: User stats by role
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  return successResponse(res, stats, 'User stats retrieved');
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, user, 'User retrieved successfully');
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return successResponse(res, user, 'User created successfully', 201);
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return successResponse(res, user, 'User updated successfully');
});

/**
 * @swagger
 * /api/v1/users/{id}/status:
 *   put:
 *     tags: [Users]
 *     summary: Toggle user active/inactive status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status toggled
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  return successResponse(res, user, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  return successResponse(res, user, 'User deleted successfully');
});

module.exports = { getAllUsers, getUserStats, getUserById, createUser, updateUser, toggleUserStatus, deleteUser };
