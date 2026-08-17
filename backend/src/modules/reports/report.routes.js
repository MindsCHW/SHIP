'use strict';

const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/config', reportController.getConfig);
router.get('/summary', reportController.getSummary);
router.get('/generate', reportController.generateReport);

module.exports = router;
