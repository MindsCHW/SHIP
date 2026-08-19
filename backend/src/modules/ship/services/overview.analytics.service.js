'use strict';

const projectRepo = require('../repositories/project.repository');
const inspectionRepo = require('../repositories/inspection.repository');

class OverviewAnalyticsService {
  async getOverview() {
    const projects = await projectRepo.getActiveProjects();
    const batches = await inspectionRepo.findBatches({});
    const inspections = await inspectionRepo.findInspections({});
    const tasks = await inspectionRepo.findTasks({});

    let activeCount = 0;
    let waitingImages = 0;
    let readyForRating = 0;

    const projectStatuses = new Set();
    
    batches.forEach(b => {
      if (['WAITING_FOR_IMAGES', 'READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'].includes(b.status)) {
        projectStatuses.add(b.project);
      }
      if (b.status === 'WAITING_FOR_IMAGES') waitingImages++;
      if (b.status === 'READY_FOR_RATING') readyForRating++;
    });

    activeCount = projectStatuses.size;

    let sumRatings = 0, critical = 0, countRatings = 0;
    const assets = new Set();
    
    inspections.forEach(insp => {
      if (insp.assetId) assets.add(insp.assetId);
      
      insp.parameters.forEach(param => {
        const val = Math.max(param.hoRating?.value || 0, param.spvRating?.value || 0);
        if (val > 0) {
          sumRatings += val;
          countRatings++;
          if (val === 1) critical++;
        }
      });
    });

    const averageRating = countRatings > 0 ? (sumRatings / countRatings).toFixed(1) : 0;
    const networkHealth = Math.round((averageRating / 10) * 100) || 0;

    const totalQuestions = tasks.length;
    const totalImages = tasks.filter(t => t.image && t.image.url).length;
    const inspectionProgress = totalQuestions > 0 ? Math.round((totalImages / totalQuestions) * 100) : 0;

    return {
      networkHealth,
      totalProjects: projects.length,
      activeProjects: activeCount,
      readyForRatingProjects: readyForRating,
      projectsWaitingForImages: waitingImages,
      totalAssets: assets.size,
      totalQuestions,
      totalImages,
      criticalIssues: critical,
      averageRating: parseFloat(averageRating),
      inspectionProgress
    };
  }
}

module.exports = new OverviewAnalyticsService();
