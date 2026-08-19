'use strict';

const mongoose = require('mongoose');
const Project = require('../../../models/Project.model');
const Inspection = require('../../../models/Inspection.model');
const InspectionBatch = require('../../../models/InspectionBatch.model');
const InspectionTask = require('../../../models/InspectionTask.model');

class ShipAnalytics {
  /**
   * Get Executive Overview KPIs
   */
  async getExecutiveOverview() {
    // Total Projects
    const totalProjectsCount = await Project.countDocuments({ isActive: true });
    
    // Active Projects
    const activeProjects = await InspectionBatch.distinct('project', { status: { $in: ['WAITING_FOR_IMAGES', 'READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'] } });
    
    // Ready for Rating Projects
    const readyForRatingProjects = await InspectionBatch.distinct('project', { status: 'READY_FOR_RATING' });

    // Total Assets (distinct chainage/assetType across all tasks)
    const totalAssetsPipeline = [
      { $group: { _id: { chainage: '$chainage', assetType: '$assetType' } } },
      { $count: 'total' }
    ];
    const totalAssetsRes = await InspectionTask.aggregate(totalAssetsPipeline);
    const totalAssetsCount = totalAssetsRes[0] ? totalAssetsRes[0].total : 0;

    // Total Questions & Images
    const tasksStats = await InspectionTask.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalImages: {
            $sum: { $cond: [{ $ifNull: ['$image.cloudinaryUrl', false] }, 1, 0] }
          }
        }
      }
    ]);
    const totalQuestions = tasksStats[0] ? tasksStats[0].totalQuestions : 0;
    const totalImages = tasksStats[0] ? tasksStats[0].totalImages : 0;

    // Average Rating & Critical Issues
    const ratingStats = await InspectionTask.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          sumRatings: { $sum: '$ratings.score' },
          criticalIssues: {
            $sum: { $cond: [{ $lte: ['$ratings.score', 1] }, 1, 0] }
          }
        }
      }
    ]);

    let averageRating = 0;
    let criticalIssues = 0;
    if (ratingStats[0] && ratingStats[0].totalRatings > 0) {
      averageRating = (ratingStats[0].sumRatings / ratingStats[0].totalRatings).toFixed(1);
      criticalIssues = ratingStats[0].criticalIssues;
    }

    const networkHealth = Math.round((averageRating / 10) * 100) || 0;

    return {
      networkHealth,
      totalProjects: totalProjectsCount,
      activeProjects: activeProjects.length,
      readyForRatingProjects: readyForRatingProjects.length,
      totalAssets: totalAssetsCount,
      totalQuestions,
      totalImages,
      criticalIssues,
      averageRating: parseFloat(averageRating),
      inspectionProgress: totalQuestions > 0 ? Math.round((totalImages / totalQuestions) * 100) : 0
    };
  }

  /**
   * Get Project Intelligence List
   */
  async getProjectIntelligence() {
    const projects = await Project.find({ isActive: true }).select('name code fullName').lean();
    const intelligenceList = [];
    
    for (const p of projects) {
      const code = p.code || p.name;
      const batches = await InspectionBatch.find({ project: code });
      const batchIds = batches.map(b => b._id);
      
      const taskStats = await InspectionTask.aggregate([
        { $match: { batchId: { $in: batchIds } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            withImages: { $sum: { $cond: [{ $ifNull: ['$image.cloudinaryUrl', false] }, 1, 0] } }
          }
        }
      ]);
      const tasksCount = taskStats[0] ? taskStats[0].total : 0;
      const imagesCount = taskStats[0] ? taskStats[0].withImages : 0;
      const progress = tasksCount > 0 ? Math.round((imagesCount / tasksCount) * 100) : 0;
      
      const inspections = await InspectionTask.find({ batchId: { $in: batchIds }, status: 'COMPLETED' }).lean();
      
      let sumRatings = 0, countRatings = 0, critical = 0;
      const categories = new Set();
      const assets = new Set();
      
      inspections.forEach(insp => {
        if (insp.category) categories.add(insp.category);
        const isRoadway = insp.category === 'Roadway' || insp.assetType === 'Roadway';
        
        if (!isRoadway) {
          if (insp.assetType) assets.add(insp.assetType);
        } else {
          // For Roadway, the actual asset types are in ratings or skips
          if (insp.skippedAssetTypes && insp.skippedAssetTypes.length > 0) {
            insp.skippedAssetTypes.forEach(skip => {
              if (skip.assetType) assets.add(skip.assetType);
            });
          }
        }
        
        insp.ratings?.forEach(rating => {
          if (isRoadway && rating.group) {
            assets.add(rating.group);
          }
          const val = rating.score || 0;
          if (val > 0) {
            sumRatings += val;
            countRatings++;
            if (val <= 1) critical++;
          }
        });
      });
      
      const avgRating = countRatings > 0 ? (sumRatings / countRatings).toFixed(1) : 0;
      const health = Math.round((avgRating / 10) * 100);
      
      intelligenceList.push({
        id: p._id,
        name: p.fullName || p.name || code,
        code: code,
        healthScore: health,
        inspectionProgress: progress,
        averageRating: parseFloat(avgRating),
        criticalIssues: critical,
        totalAssets: assets.size,
        totalCategories: categories.size,
        totalQuestions: tasksCount,
        totalImages: imagesCount,
        trend: health >= 80 ? 'up' : (health <= 40 ? 'down' : 'stable')
      });
    }
    
    return intelligenceList;
  }

  /**
   * Get detailed intelligence for a specific project
   */
  async getProjectDetails(projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) throw new Error('Project not found');
    
    const code = project.code || project.name;
    const inspections = await InspectionTask.find({ project: code, status: 'COMPLETED' }).lean();
    
    const categoryBreakdown = {};
    const assetBreakdown = {};
    
    inspections.forEach(insp => {
      const isRoadway = insp.category === 'Roadway' || insp.assetType === 'Roadway';
      
      if (!isRoadway) {
        // Standard asset processing
        const catKey = insp.category || insp.assetType || 'Uncategorized';
        if (!categoryBreakdown[catKey]) {
          categoryBreakdown[catKey] = { count: 0, ratingSum: 0, ratingCount: 0 };
        }
        categoryBreakdown[catKey].count++;
        
        const assetKey = insp.assetSubType || insp.assetType || 'Other';
        if (!assetBreakdown[assetKey]) {
          assetBreakdown[assetKey] = { count: 0, ratingSum: 0, ratingCount: 0 };
        }
        assetBreakdown[assetKey].count++;
        
        insp.ratings?.forEach(rating => {
          const val = rating.score || 0;
          if (val > 0) {
            categoryBreakdown[catKey].ratingSum += val;
            categoryBreakdown[catKey].ratingCount++;
            
            assetBreakdown[assetKey].ratingSum += val;
            assetBreakdown[assetKey].ratingCount++;
          }
        });
      } else {
        // Roadway specific processing based on rating.group
        const catKey = 'Roadway';
        if (!categoryBreakdown[catKey]) {
          categoryBreakdown[catKey] = { count: 0, ratingSum: 0, ratingCount: 0 };
        }
        categoryBreakdown[catKey].count++;
        
        // Ensure skipped assets are counted in breakdown count (for coverage analysis)
        if (insp.skippedAssetTypes && insp.skippedAssetTypes.length > 0) {
          insp.skippedAssetTypes.forEach(skip => {
            const assetKey = skip.assetType || 'Other';
            if (!assetBreakdown[assetKey]) {
              assetBreakdown[assetKey] = { count: 0, ratingSum: 0, ratingCount: 0 };
            }
            assetBreakdown[assetKey].count++;
          });
        }
        
        insp.ratings?.forEach(rating => {
          const assetKey = rating.group || 'Other';
          if (!assetBreakdown[assetKey]) {
            assetBreakdown[assetKey] = { count: 0, ratingSum: 0, ratingCount: 0 };
          }
          // We increment count per rating.group found? 
          // Actually, we should only increment count once per unique group per inspection.
          // Let's do that below by tracking seen groups.
        });
        
        const seenGroups = new Set();
        insp.ratings?.forEach(rating => {
          const assetKey = rating.group || 'Other';
          if (!seenGroups.has(assetKey)) {
             assetBreakdown[assetKey].count++;
             seenGroups.add(assetKey);
          }
          
          const val = rating.score || 0;
          if (val > 0) {
            categoryBreakdown[catKey].ratingSum += val;
            categoryBreakdown[catKey].ratingCount++;
            
            assetBreakdown[assetKey].ratingSum += val;
            assetBreakdown[assetKey].ratingCount++;
          }
        });
      }
    });
    
    const formatBreakdown = (obj) => Object.keys(obj).map(key => ({
      name: key,
      count: obj[key].count,
      avgRating: obj[key].ratingCount > 0 ? parseFloat((obj[key].ratingSum / obj[key].ratingCount).toFixed(1)) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      project: { id: project._id, name: project.fullName, code },
      categoryBreakdown: formatBreakdown(categoryBreakdown),
      assetBreakdown: formatBreakdown(assetBreakdown)
    };
  }
}

module.exports = new ShipAnalytics();
