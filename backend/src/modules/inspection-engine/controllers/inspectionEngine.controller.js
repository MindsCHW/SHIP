'use strict';

const inspectionEngineService = require('../services/inspectionEngine.service');
const { successResponse } = require('../../../utils/response.util');
const asyncHandler = require('../../../utils/asyncHandler.util');

const createBatch = asyncHandler(async (req, res, next) => {
  try {
    const batch = await inspectionEngineService.createBatch(req.user._id, req.body);
    return successResponse(res, batch, 'Inspection batch created successfully', 201);
  } catch (error) {
    if (error.code === 'ALL_INSPECTED') {
      return res.status(409).json({
        success: false,
        code: 'ALL_INSPECTED',
        message: error.message
      });
    }
    next(error);
  }
});

const previewRoadwayBatch = asyncHandler(async (req, res) => {
  const preview = await inspectionEngineService.previewRoadwayBatch(req.user._id, req.body);
  return successResponse(res, preview, 'Roadway batch preview generated successfully');
});

const createRoadwayBatch = asyncHandler(async (req, res) => {
  const batch = await inspectionEngineService.createRoadwayBatch(req.user._id, req.body);
  return successResponse(res, batch, 'Roadway batch created successfully', 201);
});

const listBatches = asyncHandler(async (req, res) => {
  const batches = await inspectionEngineService.listBatches(req.query);
  return successResponse(res, batches, 'Inspection batches retrieved successfully');
});

const getBatchDetails = asyncHandler(async (req, res) => {
  const batchDetails = await inspectionEngineService.getBatchDetails(req.params.id);
  return successResponse(res, batchDetails, 'Batch details retrieved successfully');
});

const deleteBatch = asyncHandler(async (req, res) => {
  // Only admins can delete batches
  const role = req.user.role.toLowerCase();
  if (role !== 'admin' && role !== 'superadmin') {
    throw new Error('Unauthorized to delete batches');
  }
  await inspectionEngineService.deleteBatch(req.params.id);
  return successResponse(res, null, 'Batch deleted successfully');
});

const getExtractionReport = asyncHandler(async (req, res) => {
  const report = await inspectionEngineService.getExtractionReport(req.params.id);
  return successResponse(res, report, 'Extraction report retrieved successfully');
});

module.exports = {
  createBatch,
  previewRoadwayBatch,
  createRoadwayBatch,
  listBatches,
  getBatchDetails,
  deleteBatch,
  getExtractionReport
};
