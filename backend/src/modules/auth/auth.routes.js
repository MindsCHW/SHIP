'use strict';

const express = require('express');
const router = express.Router();

const { login, register, getMe, changePassword } = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { loginSchema, registerSchema, changePasswordSchema } = require('./auth.validator');

// Public routes
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/register', authenticate, requireRole('Admin'), validate(registerSchema), register);
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
