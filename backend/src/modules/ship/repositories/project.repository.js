'use strict';

const Project = require('../../../models/Project.model');
const MasterList = require('../../../models/MasterList.model');

class ProjectRepository {
  async getAllProjects() {
    return await Project.find({}).lean();
  }

  async getActiveProjects() {
    return await Project.find({ isActive: true }).lean();
  }

  async getProjectById(projectId) {
    return await Project.findById(projectId).lean();
  }

  async getProjectByCode(code) {
    return await Project.findOne({ code }).lean();
  }

  async getMasterListProjects() {
    return await MasterList.distinct('project');
  }
}

module.exports = new ProjectRepository();
