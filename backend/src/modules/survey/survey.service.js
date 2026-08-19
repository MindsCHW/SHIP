'use strict';

const Inspection = require('../../models/Inspection.model');
const SurveyImport = require('../../models/SurveyImport.model');
const RuleEngine = require('../rule-engine/ruleEngine.service');
const Project = require('../../models/Project.model');
const logger = require('../../config/logger');

/**
 * Formats a date for display in the inspection table
 */
const formatDate = (date = new Date()) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}-${month}-${year}, ${hours}.${minutes}.${seconds} ${ampm}`;
};

/**
 * Main Survey Import function.
 * 1. Creates SurveyImport record
 * 2. Uploads image to Cloudinary (handled by multer middleware before this call)
 * 3. Runs Rule Engine to get parameters
 * 4. Creates Inspection document
 * 5. Returns inspection
 *
 * @param {object} data - Survey data fields
 * @param {object} imageResult - Cloudinary upload result (from multer)
 * @param {object} user - Authenticated user
 */
const importSurveyPoint = async (data, imageResult, user) => {
  const startTime = Date.now();

  // Verify project exists
  const project = await Project.findById(data.projectId);
  if (!project) {
    throw Object.assign(new Error(`Project not found: ${data.projectId}`), { statusCode: 404 });
  }

  // Create survey import record
  const surveyImport = await SurveyImport.create({
    projectId: data.projectId,
    filename: imageResult?.originalname || data.filename,
    importedBy: user._id,
    status: 'PROCESSING',
    metadata: data.metadata ? JSON.parse(data.metadata) : {}
  });

  try {
    // Run Rule Engine
    const { parameters } = await RuleEngine.resolveParameters({
      category: data.category,
      assetType: data.assetType,
      roadType: data.roadType,
      placement: data.placement,
      direction: data.direction
    });

    // Build image object from Cloudinary result
    const image = imageResult
      ? {
          url: imageResult.secure_url || imageResult.path,
          publicId: imageResult.public_id,
          width: imageResult.width,
          height: imageResult.height
        }
      : null;

    // Create the inspection
    const inspection = await Inspection.create({
      projectId: data.projectId,
      surveyImportId: surveyImport._id,
      chainage: data.chainage,
      category: data.category,
      assetType: data.assetType,
      roadType: data.roadType || 'MCW',
      direction: data.direction || 'LHS',
      placement: data.placement,
      typeOfWork: data.typeOfWork || 'Maintenance',
      assetId: data.assetId,
      laneType: data.laneType,
      subCategory: data.subCategory,
      image,
      parameters,
      latitude: parseFloat(data.latitude) || null,
      longitude: parseFloat(data.longitude) || null,
      timestamp: data.timestamp,
      reporter: user._id,
      reporterName: user.name,
      date: formatDate(data.timestamp || new Date()),
      hoStatus: 'PENDING',
      spvStatus: 'PENDING'
    });

    // Update survey import as completed
    await SurveyImport.findByIdAndUpdate(surveyImport._id, {
      status: 'COMPLETED',
      inspectionsGenerated: 1,
      inspectionIds: [inspection._id],
      processingTimeMs: Date.now() - startTime
    });

    logger.info(`Survey import complete: inspection ${inspection._id} created with ${parameters.length} parameters`);

    return await Inspection.findById(inspection._id).lean();
  } catch (err) {
    // Mark import as failed
    await SurveyImport.findByIdAndUpdate(surveyImport._id, {
      status: 'FAILED',
      errorMessages: [err.message]
    });
    throw err;
  }
};

/**
 * Bulk import from Survey Processor batch output (JSON array)
 */
const importBatch = async (batchData, projectId, user) => {
  const results = { success: 0, failed: 0, errors: [] };

  for (const item of batchData) {
    try {
      await importSurveyPoint({ ...item, projectId }, null, user);
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`Chainage ${item.chainage}: ${err.message}`);
    }
  }

  return results;
};

/**
 * Gets all survey imports with pagination
 */
const getSurveyImports = async (query) => {
  const filter = {};
  if (query.projectId) filter.projectId = query.projectId;
  if (query.status) filter.status = query.status;

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [imports, total] = await Promise.all([
    SurveyImport.find(filter)
      .populate('projectId', 'code fullName')
      .populate('importedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SurveyImport.countDocuments(filter)
  ]);

  return { imports, total, page, limit };
};

module.exports = { importSurveyPoint, importBatch, getSurveyImports, formatDate };
