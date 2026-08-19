'use strict';

const reportService = require('./report.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const getConfig = asyncHandler(async (req, res) => {
  const config = await reportService.getConfig();
  return successResponse(res, config, 'Report config retrieved successfully');
});

const getSummary = asyncHandler(async (req, res) => {
  const { project, cycleId } = req.query;
  const summary = await reportService.getSummary(project, cycleId);
  return successResponse(res, summary, 'Report summary retrieved successfully');
});

const generateReport = asyncHandler(async (req, res) => {
  const { project, cycleId } = req.query;
  const buffer = await reportService.generateExcelReport(project, cycleId);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="HiRATE_Report_${project}_${new Date().toISOString().slice(0, 10)}.xlsx"`);
  
  res.send(buffer);
});

module.exports = {
  getConfig,
  getSummary,
  generateReport
};
