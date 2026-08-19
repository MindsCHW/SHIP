'use strict';

const analyticsService = require('./analytics.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const getTrends = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRatingTrends(req.query.projectId, req.query.period);
  return successResponse(res, data, 'Rating trends retrieved');
});

const getAssetAnalysis = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAssetAnalysis(req.query.projectId);
  return successResponse(res, data, 'Asset analysis retrieved');
});

const getKPISummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getKPISummary(req.query.projectId);
  return successResponse(res, data, 'KPI summary retrieved');
});

const exportReport = asyncHandler(async (req, res) => {
  const report = await analyticsService.exportSummaryReport(req.query.projectId);
  const format = req.query.format || 'json';

  if (format === 'csv') {
    // Basic CSV of KPI data
    const csv = [
      'Metric,Value',
      `Total Inspections,${report.kpi.totalInspections}`,
      `Rated,${report.kpi.rated}`,
      `Pending,${report.kpi.pending}`,
      `Progress (%),${report.kpi.progress}`,
      `Avg Rating,${report.kpi.avgRating}`
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.csv"`);
    return res.send(csv);
  }

  return successResponse(res, report, 'Summary report generated');
});

module.exports = { getTrends, getAssetAnalysis, getKPISummary, exportReport };
