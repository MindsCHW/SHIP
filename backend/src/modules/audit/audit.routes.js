'use strict';

const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('./audit.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.use(authenticate);
router.get('/', requireRole('Admin'), getAuditLogs);

module.exports = router;
