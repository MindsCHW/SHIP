'use strict';

const express = require('express');
const router = express.Router();
const ratingController = require('./rating.controller');
const { getProjectRatings, getRatingSummary, getVersionHistory, getOverallRating } = ratingController;
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getProjectRatings);
router.get('/version-history', getVersionHistory);
router.get('/batches', ratingController.getReadyBatches);
router.get('/batches/:batchId/tasks', ratingController.getBatchTasks);
router.post('/tasks/:taskId/rate', ratingController.saveTaskRatings);
router.post('/tasks/:taskId/skip', ratingController.skipTask);
router.get('/project/:projectId/export', ratingController.exportRatingsCSV);
router.get('/:id/summary', getRatingSummary);
router.get('/:id/overall', getOverallRating);

module.exports = router;
