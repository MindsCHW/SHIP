'use strict';

const shipAnalytics = require('../analytics/ship.analytics');

class ShipService {
  async getOverview() {
    return await shipAnalytics.getExecutiveOverview();
  }

  async getProjects() {
    return await shipAnalytics.getProjectIntelligence();
  }

  async getProjectDetails(projectId) {
    return await shipAnalytics.getProjectDetails(projectId);
  }
}

module.exports = new ShipService();
