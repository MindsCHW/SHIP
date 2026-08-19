'use strict';

const express = require('express');
const router = express.Router();
const { getTrends, getAssetAnalysis, getKPISummary, exportReport } = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/trends', getTrends);
router.get('/assets', getAssetAnalysis);
router.get('/kpi', getKPISummary);
router.get('/export', exportReport);

module.exports = router;
