'use strict';

const workAssignmentService = require('./workAssignment.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await workAssignmentService.createAssignment(req.body, req.user);
  return successResponse(res, assignment, 'Assignment created successfully', 201);
});

const bulkAssign = asyncHandler(async (req, res) => {
  const assignments = await workAssignmentService.bulkAssign(req.body, req.user);
  return successResponse(res, assignments, `${assignments.length} assignments created`, 201);
});

const getAssignments = asyncHandler(async (req, res) => {
  const result = await workAssignmentService.getAssignments(req.query);
  return successResponse(res, result.assignments, 'Assignments retrieved', 200, result.pagination);
});

const getMyAssignments = asyncHandler(async (req, res) => {
  const assignments = await workAssignmentService.getMyAssignments(req.user._id);
  return successResponse(res, assignments, 'My assignments retrieved');
});

const updateStatus = asyncHandler(async (req, res) => {
  const assignment = await workAssignmentService.updateStatus(req.params.id, req.body.status, req.user);
  return successResponse(res, assignment, 'Status updated');
});

const editAssignment = asyncHandler(async (req, res) => {
  const assignment = await workAssignmentService.editAssignment(req.params.id, req.body, req.user);
  return successResponse(res, assignment, 'Assignment updated');
});

const deleteAssignment = asyncHandler(async (req, res) => {
  await workAssignmentService.deleteAssignment(req.params.id);
  return successResponse(res, null, 'Assignment deleted');
});

const getTimeline = asyncHandler(async (req, res) => {
  const data = await workAssignmentService.getTimeline(req.params.id);
  return successResponse(res, data, 'Timeline retrieved');
});

const getBatchesReady = asyncHandler(async (req, res) => {
  const batches = await workAssignmentService.getBatchesReady(req.query.project);
  return successResponse(res, batches, 'Ready batches retrieved');
});

const getAssignmentStats = asyncHandler(async (req, res) => {
  const stats = await workAssignmentService.getAssignmentStats(req.query.project);
  return successResponse(res, stats, 'Assignment stats retrieved');
});

module.exports = {
  createAssignment, bulkAssign, getAssignments, getMyAssignments,
  updateStatus, editAssignment, deleteAssignment, getTimeline,
  getBatchesReady, getAssignmentStats
};
