'use strict';

const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('./notification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
