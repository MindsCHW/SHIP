'use strict';

const Inspection = require('../../models/Inspection.model');
const mongoose = require('mongoose');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');
const logger = require('../../config/logger');

/**
 * Converts a string to ObjectId safely
 */
const toObjectId = (id) => mongoose.Types.ObjectId.createFromHexString(id);

/**
 * Gets inspections for a project with rich filtering.
 * Matches the RoadSummaryPage table requirements.
 */
const getInspectionsByProject = async (query) => {
  const { page, limit, skip } = getPagination(query);

  if (!query.projectId) {
    throw Object.assign(new Error('projectId is required'), { statusCode: 400 });
  }

  const filter = { projectId: toObjectId(query.projectId) };

  if (query.category) filter.category = query.category;
  if (query.assetType) filter.assetType = query.assetType;
  if (query.direction && query.direction !== 'All' && query.direction !== 'Choose Direction') {
    filter.direction = query.direction;
  }
  if (query.roadType && query.roadType !== 'All' && query.roadType !== 'Choose Road Type') {
    filter.roadType = query.roadType;
  }
  if (query.hoStatus) filter.hoStatus = query.hoStatus;
  if (query.spvStatus) filter.spvStatus = query.spvStatus;
  if (query.typeOfWork) filter.typeOfWork = query.typeOfWork;

  // Chainage range filter
  if (query.minChainage || query.maxChainage) {
    filter.chainage = {};
    if (query.minChainage) filter.chainage.$gte = query.minChainage;
    if (query.maxChainage) filter.chainage.$lte = query.maxChainage;
  }

  const [inspections, total] = await Promise.all([
    Inspection.find(filter)
      .select('-parameters -__v') // Exclude heavy fields for list view
      .populate('reporter', 'name')
      .sort({ chainage: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Inspection.countDocuments(filter)
  ]);

  return { inspections, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Gets a single inspection by ID (full detail with parameters)
 */
const getInspectionById = async (id) => {
  const inspection = await Inspection.findById(id)
    .populate('reporter', 'name email designation')
    .populate('projectId', 'code fullName');

  if (!inspection) throw Object.assign(new Error('Inspection not found'), { statusCode: 404 });
  return inspection;
};

/**
 * Submits HO ratings for an inspection.
 * Accepts array of { parameter, value, remark }
 */
const submitHORating = async (id, ratingsData, user) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) throw Object.assign(new Error('Inspection not found'), { statusCode: 404 });

  // Update each parameter's HO rating
  for (const ratingItem of ratingsData) {
    const param = inspection.parameters.find((p) => p.parameter === ratingItem.parameter);
    if (param) {
      param.hoRating = {
        value: ratingItem.value,
        remark: ratingItem.remark || '',
        ratedBy: user._id,
        ratedAt: new Date()
      };
    }
  }

  // Also save header remarks if provided
  if (ratingsData.headerRemarks) {
    inspection.headerRemarks = ratingsData.headerRemarks;
  }

  // Compute overall HO status
  const allRated = inspection.parameters.every(
    (p) => p.hoRating && p.hoRating.value !== null
  );
  if (allRated) inspection.hoStatus = 'RATED';

  await inspection.save();
  logger.info(`HO rating submitted for inspection ${id} by ${user.name}`);
  return inspection;
};

/**
 * Submits SPV ratings for an inspection.
 */
const submitSPVRating = async (id, ratingsData, user) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) throw Object.assign(new Error('Inspection not found'), { statusCode: 404 });

  for (const ratingItem of ratingsData) {
    const param = inspection.parameters.find((p) => p.parameter === ratingItem.parameter);
    if (param) {
      param.spvRating = {
        value: ratingItem.value,
        remark: ratingItem.remark || '',
        ratedBy: user._id,
        ratedAt: new Date()
      };
    }
  }

  const allRated = inspection.parameters.every(
    (p) => p.spvRating && p.spvRating.value !== null
  );
  if (allRated) inspection.spvStatus = 'RATED';

  await inspection.save();
  logger.info(`SPV rating submitted for inspection ${id} by ${user.name}`);
  return inspection;
};

/**
 * Generates CSV content for a project's inspections
 */
const generateCSV = async (projectId, query) => {
  const filter = { projectId: toObjectId(projectId) };
  if (query.category) filter.category = query.category;

  const inspections = await Inspection.find(filter)
    .populate('reporter', 'name')
    .lean();

  const headers = [
    'Status', 'Type of Work', 'Category', 'Asset Type', 'Sub Category',
    'Direction', 'Road Type', 'Chainage', 'Date Created', 'Reported By',
    'HO Status', 'SPV Status', 'Latitude', 'Longitude'
  ];

  const rows = inspections.map((insp) => [
    insp.hoStatus === 'RATED' && insp.spvStatus === 'RATED' ? 'RATED' : 'PENDING',
    insp.typeOfWork,
    insp.category,
    insp.assetType,
    insp.subCategory || '',
    insp.direction,
    insp.roadType || '',
    insp.chainage,
    insp.date || '',
    insp.reporterName || '',
    insp.hoStatus,
    insp.spvStatus,
    insp.latitude || '',
    insp.longitude || ''
  ]);

  const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return csvLines.join('\n');
};

/**
 * Gets rating history for an inspection (version tracking)
 */
const getInspectionHistory = async (id) => {
  const inspection = await Inspection.findById(id)
    .populate('parameters.hoRating.ratedBy', 'name role')
    .populate('parameters.spvRating.ratedBy', 'name role')
    .lean();

  if (!inspection) throw Object.assign(new Error('Inspection not found'), { statusCode: 404 });

  const history = inspection.parameters.map((p) => ({
    parameter: p.parameter,
    hoRating: p.hoRating,
    spvRating: p.spvRating
  }));

  return { inspectionId: id, history };
};

module.exports = {
  getInspectionsByProject,
  getInspectionById,
  submitHORating,
  submitSPVRating,
  generateCSV,
  getInspectionHistory
};
