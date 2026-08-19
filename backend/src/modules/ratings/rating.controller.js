'use strict';

const ratingService = require('./rating.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/ratings:
 *   get:
 *     tags: [Ratings]
 *     summary: Get all ratings for a project (supports RATING SUMMARY tab)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ratings list
 */
const getProjectRatings = asyncHandler(async (req, res) => {
  if (!req.query.projectId) {
    return res.status(400).json({ success: false, message: 'projectId is required', errors: [] });
  }
  const data = await ratingService.getProjectRatings(req.query.projectId, req.query);
  return successResponse(res, data, 'Ratings retrieved');
});

/**
 * @swagger
 * /api/v1/ratings/{id}/summary:
 *   get:
 *     tags: [Ratings]
 *     summary: Get rating summary for an inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rating summary
 */
const getRatingSummary = asyncHandler(async (req, res) => {
  const data = await ratingService.getRatingSummary(req.params.id);
  return successResponse(res, data, 'Rating summary retrieved');
});

/**
 * @swagger
 * /api/v1/ratings/version-history:
 *   get:
 *     tags: [Ratings]
 *     summary: Get rating version history for a project (powers RATING VERSION HISTORY tab)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Version history
 */
const getVersionHistory = asyncHandler(async (req, res) => {
  if (!req.query.projectId) {
    return res.status(400).json({ success: false, message: 'projectId is required', errors: [] });
  }
  const data = await ratingService.getVersionHistory(req.query.projectId);
  return successResponse(res, data, 'Version history retrieved');
});

/**
 * @swagger
 * /api/v1/ratings/{id}/overall:
 *   get:
 *     tags: [Ratings]
 *     summary: Compute overall rating for a single inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Overall rating
 */
const getOverallRating = asyncHandler(async (req, res) => {
  const data = await ratingService.computeOverallRating(req.params.id);
  return successResponse(res, data, 'Overall rating computed');
});

const getReadyBatches = asyncHandler(async (req, res) => {
  const data = await ratingService.getReadyBatches(req.user);
  return successResponse(res, data, 'Ready batches retrieved');
});

const getBatchTasks = asyncHandler(async (req, res) => {
  const data = await ratingService.getBatchTasks(req.params.batchId, req.user);
  return successResponse(res, data, 'Batch tasks retrieved');
});

const saveTaskRatings = asyncHandler(async (req, res) => {
  const data = await ratingService.saveTaskRatings(req.params.taskId, req.body.ratings, req.body.selectedImageUrl, req.user);
  return successResponse(res, data, 'Task ratings saved');
});

const exportRatingsCSV = asyncHandler(async (req, res) => {
  const csvData = await ratingService.exportRatingsCSV(req.params.projectId, req.query.batchId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=Ratings_${req.params.projectId}.csv`);
  res.send(csvData);
});

const skipTask = asyncHandler(async (req, res) => {
  const data = await ratingService.skipTask(req.params.taskId, req.body, req.user);
  return successResponse(res, data, 'Task skipped successfully');
});

module.exports = { getProjectRatings, getRatingSummary, getVersionHistory, getOverallRating, getReadyBatches, getBatchTasks, saveTaskRatings, skipTask, exportRatingsCSV };
