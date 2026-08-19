'use strict';

const surveyService = require('./survey.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/survey/import:
 *   post:
 *     tags: [Survey]
 *     summary: Import a single survey point (image + metadata)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [projectId, chainage, category, assetType]
 *             properties:
 *               image: { type: string, format: binary }
 *               projectId: { type: string }
 *               chainage: { type: string }
 *               category: { type: string }
 *               assetType: { type: string }
 *               roadType: { type: string, enum: [MCW, SR] }
 *               direction: { type: string, enum: [LHS, RHS] }
 *               placement: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               timestamp: { type: string }
 *               metadata: { type: string, description: "JSON string of Survey Processor raw output" }
 *     responses:
 *       201:
 *         description: Inspection created with dynamically resolved parameters
 */
const importSurveyPoint = asyncHandler(async (req, res) => {
  let imageResult = null;

  // If a file was uploaded, push it to Cloudinary via stream
  if (req.file) {
    const { uploadToCloudinary } = require('../../middleware/upload.middleware');
    imageResult = await uploadToCloudinary(req.file.buffer, {
      original_filename: req.file.originalname
    });
    imageResult.originalname = req.file.originalname;
  }

  const inspection = await surveyService.importSurveyPoint(req.body, imageResult, req.user);
  return successResponse(res, inspection, 'Survey imported. Inspection generated successfully.', 201);
});

/**
 * @swagger
 * /api/v1/survey/import/batch:
 *   post:
 *     tags: [Survey]
 *     summary: Bulk import from Survey Processor JSON batch output
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, data]
 *             properties:
 *               projectId: { type: string }
 *               data: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Batch import results
 */
const importBatch = asyncHandler(async (req, res) => {
  const { projectId, data } = req.body;
  if (!projectId || !Array.isArray(data) || !data.length) {
    return res.status(400).json({
      success: false,
      message: 'projectId and data array are required',
      errors: []
    });
  }

  const results = await surveyService.importBatch(data, projectId, req.user);
  return successResponse(res, results, `Batch import complete: ${results.success} succeeded, ${results.failed} failed`);
});

/**
 * @swagger
 * /api/v1/survey/imports:
 *   get:
 *     tags: [Survey]
 *     summary: List all survey imports
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PROCESSING, COMPLETED, FAILED] }
 *     responses:
 *       200:
 *         description: Survey import list
 */
const getSurveyImports = asyncHandler(async (req, res) => {
  const result = await surveyService.getSurveyImports(req.query);
  return successResponse(res, result.imports, 'Survey imports retrieved', 200, {
    total: result.total, page: result.page, limit: result.limit
  });
});

module.exports = { importSurveyPoint, importBatch, getSurveyImports };
