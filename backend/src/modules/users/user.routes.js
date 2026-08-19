'use strict';

const express = require('express');
const router = express.Router();

const {
  getAllUsers, getUserStats, getUserById,
  createUser, updateUser, toggleUserStatus, deleteUser
} = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// All user routes require authentication
router.use(authenticate);

router.get('/stats', requireRole('Admin'), getUserStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', requireRole('Admin'), createUser);
router.put('/:id', requireRole('Admin'), updateUser);
router.put('/:id/status', requireRole('Admin'), toggleUserStatus);
router.delete('/:id', requireRole('Admin'), deleteUser);

module.exports = router;
