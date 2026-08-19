'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const { requireRole } = require('../../../middleware/role.middleware');
const imageReviewController = require('../controllers/imageReview.controller');

router.use(authenticate);
router.use(requireRole('Admin', 'Manager'));

// Get all batches ready for review
router.get('/batches', imageReviewController.getBatchesForReview);

// Get all tasks for a specific batch
router.get('/batches/:batchId/tasks', imageReviewController.getBatchTasks);

// Approve a batch
router.post('/batches/:batchId/approve', imageReviewController.approveBatch);

// Reject a batch
router.post('/batches/:batchId/reject', imageReviewController.rejectBatch);

// Update a single task's status (Approve/Reject)
router.put('/tasks/:taskId', imageReviewController.updateTaskStatus);

module.exports = router;
