'use strict';

const Project = require('../../models/Project.model');
const Inspection = require('../../models/Inspection.model');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');

/**
 * Gets all projects with optional status filter
 */
const getAllProjects = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { code: { $regex: query.search, $options: 'i' } },
      { fullName: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('assignedSPV', 'name email')
      .populate('assignedHO', 'name email')
      .sort({ code: 1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter)
  ]);

  return { projects, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Gets a single project by ID
 */
const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('assignedSPV', 'name email designation')
    .populate('assignedHO', 'name email designation');

  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  return project;
};

/**
 * Gets a project by code (e.g. "APEL")
 */
const getProjectByCode = async (code) => {
  const project = await Project.findOne({ code: code.toUpperCase() });
  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  return project;
};

/**
 * Creates a new project
 */
const createProject = async (data) => {
  const project = await Project.create(data);
  return project;
};

/**
 * Updates a project
 */
const updateProject = async (id, data) => {
  const project = await Project.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
  return project;
};

/**
 * Gets project inspection statistics
 */
const getProjectStats = async (projectId) => {
  const stats = await Inspection.aggregate([
    { $match: { projectId: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        hoPending: { $sum: { $cond: [{ $eq: ['$hoStatus', 'PENDING'] }, 1, 0] } },
        hoRated: { $sum: { $cond: [{ $eq: ['$hoStatus', 'RATED'] }, 1, 0] } },
        spvPending: { $sum: { $cond: [{ $eq: ['$spvStatus', 'PENDING'] }, 1, 0] } },
        spvRated: { $sum: { $cond: [{ $eq: ['$spvStatus', 'RATED'] }, 1, 0] } }
      }
    }
  ]);

  const categoryBreakdown = await Inspection.aggregate([
    { $match: { projectId: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    ...(stats[0] || { total: 0, hoPending: 0, hoRated: 0, spvPending: 0, spvRated: 0 }),
    _id: undefined,
    categoryBreakdown
  };
};

/**
 * Gets status distribution across all projects
 */
const getStatusDistribution = async () => {
  return Project.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectByCode,
  createProject,
  updateProject,
  getProjectStats,
  getStatusDistribution
};
