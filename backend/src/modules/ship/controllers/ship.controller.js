const overviewService = require('../services/overview.analytics.service');
const projectService = require('../services/project.analytics.service');
const relationshipService = require('../services/relationship.analytics.service');
const spatialService = require('../services/spatial.analytics.service');
const temporalService = require('../services/temporal.analytics.service');
const decisionService = require('../services/decision.analytics.service');
const cache = require('../ship.cache');
const { successResponse } = require('../../../utils/response.util');
const asyncHandler = require('../../../utils/asyncHandler.util');

const getOverview = asyncHandler(async (req, res) => {
  const cacheKey = 'ship:overview';
  let data = cache.get(cacheKey);
  
  if (!data) {
    data = await overviewService.getOverview();
    cache.set(cacheKey, data, 300); // Cache for 5 mins
  }
  
  return successResponse(res, data, 'SHIP Overview Analytics retrieved successfully');
});

const getProjects = asyncHandler(async (req, res) => {
  const cacheKey = 'ship:projects';
  let data = cache.get(cacheKey);
  
  if (!data) {
    data = await projectService.getProjectIntelligence();
    cache.set(cacheKey, data, 300);
  }
  
  return successResponse(res, data, 'SHIP Project Intelligence retrieved successfully');
});

const getAssets = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Asset intelligence coming soon');
});

const getCategories = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Category intelligence coming soon');
});

const getRatings = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Rating intelligence coming soon');
});

const getInspection = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Inspection intelligence coming soon');
});

const getUsers = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'User intelligence coming soon');
});

const getRisk = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Risk intelligence coming soon');
});

const getTrends = asyncHandler(async (req, res) => {
  return successResponse(res, [], 'Trend intelligence coming soon');
});

const getRelationshipIntelligence = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) return successResponse(res, null, 'Project code is required');

  const cacheKey = `ship:relationship:${project}`;
  let data = cache.get(cacheKey);

  if (!data) {
    data = await relationshipService.getFullRelationshipIntelligence(project);
    cache.set(cacheKey, data, 300);
  }

  return successResponse(res, data, 'SHIP Relationship Intelligence retrieved successfully');
});

const getSpatialIntelligence = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) return successResponse(res, null, 'Project code is required');

  const cacheKey = `ship:spatial:${project}`;
  let data = cache.get(cacheKey);

  if (!data) {
    data = await spatialService.getProjectSpatialData(project);
    cache.set(cacheKey, data, 300);
  }

  return successResponse(res, data, 'SHIP Spatial Intelligence retrieved successfully');
});

const getTemporalIntelligence = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) return successResponse(res, null, 'Project code is required');

  const cacheKey = `ship:temporal:${project}`;
  let data = cache.get(cacheKey);

  if (!data) {
    data = await temporalService.getProjectTemporalData(project);
    cache.set(cacheKey, data, 300);
  }

  return successResponse(res, data, 'SHIP Temporal Intelligence retrieved successfully');
});

const getDecisionIntelligence = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) return successResponse(res, null, 'Project code is required');

  const cacheKey = `ship:decision:${project}`;
  let data = cache.get(cacheKey);

  if (!data) {
    data = await decisionService.getDecisionIntelligence(project);
    cache.set(cacheKey, data, 300);
  }

  return successResponse(res, data, 'SHIP Decision Intelligence retrieved successfully');
});

module.exports = {
  getOverview,
  getProjects,
  getAssets,
  getCategories,
  getRatings,
  getInspection,
  getUsers,
  getRisk,
  getTrends,
  getRelationshipIntelligence,
  getSpatialIntelligence,
  getTemporalIntelligence,
  getDecisionIntelligence
};
