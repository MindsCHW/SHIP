'use strict';

const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/dashboard/executive:
 *   get:
 *     tags: [Dashboard]
 *     summary: Global executive KPIs (powers ExecutiveCards)
 *     responses:
 *       200:
 *         description: Executive KPIs
 */
const getExecutiveKPIs = asyncHandler(async (req, res) => {
  const data = await dashboardService.getExecutiveKPIs(req.user._id);
  return successResponse(res, data, 'Executive KPIs retrieved');
});

const getUserKPIs = asyncHandler(async (req, res) => {
  const data = await dashboardService.getUserKPIs(req.user._id);
  return successResponse(res, data, 'User KPIs retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/project/{id}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Project-specific KPIs (powers KPICards)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project KPIs
 */
const getProjectKPIs = asyncHandler(async (req, res) => {
  const data = await dashboardService.getProjectKPIs(req.params.id);
  return successResponse(res, data, 'Project KPIs retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/roads-status:
 *   get:
 *     tags: [Dashboard]
 *     summary: Road status distribution for donut chart (powers DashboardChart)
 *     responses:
 *       200:
 *         description: Status distribution
 */
const getRoadsStatus = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRoadsStatus();
  return successResponse(res, data, 'Roads status retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/category-distribution:
 *   get:
 *     tags: [Dashboard]
 *     summary: Category distribution for charts
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category distribution
 */
const getCategoryDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryDistribution(req.query.projectId);
  return successResponse(res, data, 'Category distribution retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/daily-ratings:
 *   get:
 *     tags: [Dashboard]
 *     summary: Daily rating trend
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Daily ratings data
 */
const getDailyRatings = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDailyRatings(req.query.projectId, req.query.days);
  return successResponse(res, data, 'Daily ratings retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/inspector-leaderboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Inspector leaderboard (powers InspectorLeaderboard)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Inspector leaderboard
 */
const getInspectorLeaderboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getInspectorLeaderboard(req.query.projectId, req.query.limit);
  return successResponse(res, data, 'Inspector leaderboard retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/recent-activity:
 *   get:
 *     tags: [Dashboard]
 *     summary: Recent activity timeline (powers RecentActivityTimeline)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Recent activity list
 */
const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentActivity(req.query.projectId, req.query.limit);
  return successResponse(res, data, 'Recent activity retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/map:
 *   get:
 *     tags: [Dashboard]
 *     summary: All projects map data (powers AllProjectsMap & ProjectMap)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Projects with coordinates or GPS points
 */
const getAllProjectsMapData = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAllProjectsMapData(req.query.projectId);
  return successResponse(res, data, 'Map data retrieved');
});

/**
 * @swagger
 * /api/v1/dashboard/charts:
 *   get:
 *     tags: [Dashboard]
 *     summary: All charts data (powers AnalyticsCharts)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Charts data
 */
const getChartsData = asyncHandler(async (req, res) => {
  const data = await dashboardService.getChartsData(req.query.projectId);
  return successResponse(res, data, 'Charts data retrieved');
});

const getSkipAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSkipAnalytics(req.query.projectId, null, req.query);
  return successResponse(res, data, 'Skip analytics retrieved');
});

module.exports = {
  getExecutiveKPIs,
  getUserKPIs,
  getProjectKPIs,
  getRoadsStatus,
  getCategoryDistribution,
  getDailyRatings,
  getInspectorLeaderboard,
  getRecentActivity,
  getAllProjectsMapData,
  getChartsData,
  getSkipAnalytics
};
