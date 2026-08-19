'use strict';

const projectService = require('./project.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List all projects
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ON-GOING, HO-PROCESS, HO-RATED, SPV-RATED, NOT-RATED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Project list
 */
const getAllProjects = asyncHandler(async (req, res) => {
  const result = await projectService.getAllProjects(req.query);
  return successResponse(res, result.projects, 'Projects retrieved successfully', 200, result.pagination);
});

/**
 * @swagger
 * /api/v1/projects/status-distribution:
 *   get:
 *     tags: [Projects]
 *     summary: Get project status distribution for charts
 *     responses:
 *       200:
 *         description: Status counts
 */
const getStatusDistribution = asyncHandler(async (req, res) => {
  const data = await projectService.getStatusDistribution();
  return successResponse(res, data, 'Status distribution retrieved');
});

/**
 * @swagger
 * /api/v1/projects/code/{code}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by code (e.g. APEL)
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Not found
 */
const getProjectByCode = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByCode(req.params.code);
  return successResponse(res, project, 'Project retrieved');
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project details
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  return successResponse(res, project, 'Project retrieved');
});

/**
 * @swagger
 * /api/v1/projects/{id}/stats:
 *   get:
 *     tags: [Projects]
 *     summary: Get inspection statistics for a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project inspection stats
 */
const getProjectStats = asyncHandler(async (req, res) => {
  const stats = await projectService.getProjectStats(req.params.id);
  return successResponse(res, stats, 'Project stats retrieved');
});

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project (Admin only)
 *     responses:
 *       201:
 *         description: Project created
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body);
  return successResponse(res, project, 'Project created successfully', 201);
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Update a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  return successResponse(res, project, 'Project updated successfully');
});

module.exports = {
  getAllProjects, getStatusDistribution, getProjectByCode,
  getProjectById, getProjectStats, createProject, updateProject
};
