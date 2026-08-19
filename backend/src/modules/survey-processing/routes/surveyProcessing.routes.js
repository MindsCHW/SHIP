'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const { requireRole } = require('../../../middleware/role.middleware');
const surveyProcessingController = require('../controllers/surveyProcessing.controller');

router.use(authenticate);
router.use(requireRole('Admin', 'Manager'));

// Get all batches waiting for images
router.get('/batches', surveyProcessingController.getPendingBatches);

// Extract images for a project
router.post('/extract/:project', surveyProcessingController.extractImages);

module.exports = router;
