const masterListRepository = require('./masterList.repository');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const getMasterList = asyncHandler(async (req, res) => {
  const masterList = await masterListRepository.getMasterList(req.query);
  return successResponse(res, masterList, 'Master list fetched successfully');
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await masterListRepository.getProjects();
  return successResponse(res, projects, 'Projects fetched successfully');
});

const getCategories = asyncHandler(async (req, res) => {
  const { project } = req.query;
  const categories = await masterListRepository.getCategories(project);
  return successResponse(res, categories, 'Categories fetched successfully');
});

const getAssetTypes = asyncHandler(async (req, res) => {
  const assets = await masterListRepository.getAssetTypes(req.query);
  return successResponse(res, assets, 'Assets fetched successfully');
});

const getRoadTypes = asyncHandler(async (req, res) => {
  // Use project from query if available
  const { project } = req.query;
  const roadTypes = await masterListRepository.getRoadTypes(project);
  return successResponse(res, roadTypes, 'Road types fetched successfully');
});

const getParameters = asyncHandler(async (req, res) => {
  const parameters = await masterListRepository.getParameters();
  return successResponse(res, parameters, 'Parameters fetched successfully');
});

const getChainages = asyncHandler(async (req, res) => {
  const chainages = await masterListRepository.getChainages();
  return successResponse(res, chainages, 'Chainages fetched successfully');
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await masterListRepository.getStats();
  return successResponse(res, stats, 'Master stats fetched successfully');
});

const importMasterList = asyncHandler(async (req, res) => {
  // Use the service directly for business logic since it requires file buffer and db transactions
  const masterListService = require('./masterList.service');
  
  if (!req.file) {
    throw new Error('Please upload an Excel or CSV file.');
  }

  const { project, importMode } = req.body;
  if (!project) throw new Error('Project name is required.');

  const result = await masterListService.importMasterList(req.file.buffer, project, importMode || 'append');
  
  return successResponse(res, result, 'Master List imported successfully', 201);
});

const updateMasterListItem = asyncHandler(async (req, res) => {
  const masterListService = require('./masterList.service');
  const result = await masterListService.updateMasterListItem(req.params.id, req.body);
  return successResponse(res, result, 'Master List item updated successfully');
});

const deleteMasterListItem = asyncHandler(async (req, res) => {
  const masterListService = require('./masterList.service');
  const result = await masterListService.deleteMasterListItem(req.params.id);
  return successResponse(res, result, 'Master List item deleted successfully');
});

const deleteProjectMasterList = asyncHandler(async (req, res) => {
  const masterListService = require('./masterList.service');
  const result = await masterListService.deleteProjectMasterList(req.params.projectName);
  return successResponse(res, result, 'Project Master List deleted successfully');
});

const fixImageRequirements = asyncHandler(async (req, res) => {
  const masterListService = require('./masterList.service');
  const { project } = req.query; // optional: ?project=SPPL to fix just one project
  const result = await masterListService.fixImageRequirements(project || null);
  return successResponse(res, result, `Image requirements fixed: ${result.updated} records updated out of ${result.total} total.`);
});

module.exports = {
  getMasterList,
  getProjects,
  getCategories,
  getAssetTypes,
  getRoadTypes,
  getParameters,
  getChainages,
  getStats,
  importMasterList,
  updateMasterListItem,
  deleteMasterListItem,
  deleteProjectMasterList,
  fixImageRequirements
};
