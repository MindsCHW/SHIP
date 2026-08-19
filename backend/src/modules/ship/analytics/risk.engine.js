'use strict';

class RiskEngine {
  analyzeRisk(projectsData, assetsData) {
    // Sort projects by health score (lowest first) to identify high-risk projects
    const highRiskProjects = [...projectsData]
      .filter(p => p.healthScore < 50)
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 5);

    // Sort assets by critical issues (highest first)
    const highRiskAssets = [...assetsData]
      .sort((a, b) => b.criticalCount - a.criticalCount)
      .slice(0, 5);

    const totalCriticalIssues = projectsData.reduce((acc, curr) => acc + (curr.criticalIssues || 0), 0);

    return {
      highRiskProjects,
      highRiskAssets,
      totalCriticalIssues
    };
  }
}

module.exports = new RiskEngine();
