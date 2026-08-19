'use strict';

const express = require('express');
const router = express.Router();

const {
  getExecutiveKPIs, getProjectKPIs, getRoadsStatus,
  getCategoryDistribution, getDailyRatings,
  getInspectorLeaderboard, getRecentActivity, getAllProjectsMapData,
  getChartsData, getUserKPIs, getSkipAnalytics
} = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/user-kpis', getUserKPIs);
router.get('/executive', getExecutiveKPIs);
router.get('/roads-status', getRoadsStatus);
router.get('/category-distribution', getCategoryDistribution);
router.get('/daily-ratings', getDailyRatings);
router.get('/inspector-leaderboard', getInspectorLeaderboard);
router.get('/recent-activity', getRecentActivity);
router.get('/map', getAllProjectsMapData);
router.get('/charts', getChartsData);
router.get('/skip-analytics', getSkipAnalytics);
router.get('/project/:id', getProjectKPIs);

module.exports = router;
