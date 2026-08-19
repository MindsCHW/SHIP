'use strict';

const inspectionService = require('./inspection.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/inspections:
 *   get:
 *     tags: [Inspections]
 *     summary: List inspections for a project (supports all RoadSummaryPage filters)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: direction
 *         schema: { type: string, enum: [LHS, RHS, All] }
 *       - in: query
 *         name: roadType
 *         schema: { type: string, enum: [MCW, SR, All] }
 *       - in: query
 *         name: minChainage
 *         schema: { type: string }
 *       - in: query
 *         name: maxChainage
 *         schema: { type: string }
 *       - in: query
 *         name: hoStatus
 *         schema: { type: string, enum: [PENDING, RATED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inspection list
 */
const getInspections = asyncHandler(async (req, res) => {
  const result = await inspectionService.getInspectionsByProject(req.query);
  return successResponse(res, result.inspections, 'Inspections retrieved', 200, result.pagination);
});

/**
 * @swagger
 * /api/v1/inspections/export:
 *   get:
 *     tags: [Inspections]
 *     summary: Export inspections to CSV
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
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
const exportCSV = asyncHandler(async (req, res) => {
  if (!req.query.projectId) {
    return res.status(400).json({ success: false, message: 'projectId is required', errors: [] });
  }

  const csv = await inspectionService.generateCSV(req.query.projectId, req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="inspections-${req.query.projectId}-${Date.now()}.csv"`);
  return res.send(csv);
});

/**
 * @swagger
 * /api/v1/inspections/{id}:
 *   get:
 *     tags: [Inspections]
 *     summary: Get full inspection detail (including parameters for rating UI)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full inspection with parameters
 */
const getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspectionById(req.params.id);
  return successResponse(res, inspection, 'Inspection retrieved');
});

/**
 * @swagger
 * /api/v1/inspections/{id}/ho-rating:
 *   put:
 *     tags: [Inspections]
 *     summary: Submit HO ratings for an inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ratings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parameter: { type: string }
 *                     value: { type: number, enum: [0, 1, 5, 10] }
 *                     remark: { type: string }
 *     responses:
 *       200:
 *         description: HO ratings saved
 */
const submitHORating = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.submitHORating(
    req.params.id,
    req.body.ratings || req.body,
    req.user
  );
  return successResponse(res, inspection, 'HO rating submitted successfully');
});

/**
 * @swagger
 * /api/v1/inspections/{id}/spv-rating:
 *   put:
 *     tags: [Inspections]
 *     summary: Submit SPV ratings for an inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ratings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parameter: { type: string }
 *                     value: { type: number, enum: [0, 1, 5, 10] }
 *                     remark: { type: string }
 *     responses:
 *       200:
 *         description: SPV ratings saved
 */
const submitSPVRating = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.submitSPVRating(
    req.params.id,
    req.body.ratings || req.body,
    req.user
  );
  return successResponse(res, inspection, 'SPV rating submitted successfully');
});

/**
 * @swagger
 * /api/v1/inspections/{id}/history:
 *   get:
 *     tags: [Inspections]
 *     summary: Get rating history for an inspection (RATING VERSION HISTORY tab)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rating history
 */
const getInspectionHistory = asyncHandler(async (req, res) => {
  const history = await inspectionService.getInspectionHistory(req.params.id);
  return successResponse(res, history, 'Rating history retrieved');
});

module.exports = { getInspections, exportCSV, getInspectionById, submitHORating, submitSPVRating, getInspectionHistory };
