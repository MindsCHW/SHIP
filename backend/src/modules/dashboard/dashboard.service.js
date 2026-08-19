'use strict';

const InspectionTask = require('../../models/InspectionTask.model');
const Project = require('../../models/Project.model');
const mongoose = require('mongoose');

// Helper to determine if a string is a valid ObjectId
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (new String(id).length === 12 || new String(id).length === 24);

/**
 * Global Executive Summary KPIs
 */
const getExecutiveKPIs = async (userId) => {
  const [
    totalProjects,
    totalInspections,
    ratedInspections,
    paramStats,
    criticalCount,
    avgRatingResult,
    greenRatedProjects,
    userEvaluatedImagesCount
  ] = await Promise.all([
    Project.countDocuments({ isActive: true }),
    InspectionTask.countDocuments({ status: { $in: ['READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'] } }),
    InspectionTask.countDocuments({ status: 'COMPLETED' }),
    InspectionTask.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $project: { paramCount: { $size: { $ifNull: ['$ratings', []] } } } },
      { $group: { _id: null, total: { $sum: '$paramCount' } } }
    ]),
    InspectionTask.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      { $match: { 'ratings.score': { $lte: 1 } } }, // Critical threshold defined as <= 1
      { $count: 'total' }
    ]),
    InspectionTask.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      { $match: { 'ratings.score': 10 } },
      { $count: 'total' }
    ]),
    InspectionTask.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      { $group: { _id: '$project', avgRating: { $avg: '$ratings.score' } } },
      { $match: { avgRating: { $gte: 7 } } },
      { $count: 'count' }
    ]),
    InspectionTask.countDocuments({ status: 'COMPLETED', approvedBy: userId })
  ]);

  const totalRatingsCount = paramStats[0]?.total || 0;
  const perfect10Count = avgRatingResult[0]?.total || 0;
  const perfect10Percentage = totalRatingsCount > 0 ? parseFloat(((perfect10Count / totalRatingsCount) * 100).toFixed(2)) : 0;

  return {
    totalProjects,
    totalInspections,
    ratedInspections,
    pendingInspections: totalInspections - ratedInspections,
    parametersEvaluated: totalRatingsCount,
    userEvaluatedImages: userEvaluatedImagesCount,
    criticalObservations: criticalCount[0]?.total || 0,
    perfect10Percentage,
    greenRatedProjects: greenRatedProjects[0]?.count || 0,
    overallProgress: totalInspections > 0
      ? parseFloat(((ratedInspections / totalInspections) * 100).toFixed(1))
      : 0
  };
};

/**
 * User-specific KPIs (Powers UserDashboard)
 */
const getUserKPIs = async (userId) => {
  const WorkAssignment = require('../../models/WorkAssignment.model');
  const now = new Date();
  
  // Create start and end of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [pending, inProgress, completedToday, overdue, dueToday] = await Promise.all([
    WorkAssignment.countDocuments({ assignedTo: userId, status: 'Assigned' }),
    WorkAssignment.countDocuments({ assignedTo: userId, status: 'In Progress' }),
    WorkAssignment.countDocuments({ 
      assignedTo: userId, 
      status: 'Completed',
      updatedAt: { $gte: startOfToday, $lte: endOfToday }
    }),
    WorkAssignment.countDocuments({ 
      assignedTo: userId, 
      status: { $in: ['Assigned', 'In Progress'] },
      dueDate: { $lt: startOfToday }
    }),
    WorkAssignment.countDocuments({ 
      assignedTo: userId, 
      status: { $in: ['Assigned', 'In Progress'] },
      dueDate: { $gte: startOfToday, $lte: endOfToday }
    })
  ]);

  return {
    pendingAssignments: pending,
    inProgress,
    completedToday,
    overdue,
    dueToday
  };
};

/**
 * Project-specific KPIs
 */
const getProjectKPIs = async (projectId, batchId = null) => {
  const filter = { project: projectId };
  if (batchId) filter.batchId = mongoose.Types.ObjectId(batchId);

  const [total, completed, paramStats, criticalCount, avgRatingResult, lastUpdated] = await Promise.all([
    InspectionTask.countDocuments({ ...filter, status: { $in: ['READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'] } }),
    InspectionTask.countDocuments({ ...filter, status: 'COMPLETED' }),
    InspectionTask.aggregate([
      { $match: { ...filter, status: 'COMPLETED' } },
      { $project: { paramCount: { $size: { $ifNull: ['$ratings', []] } } } },
      { $group: { _id: null, total: { $sum: '$paramCount' } } }
    ]),
    InspectionTask.aggregate([
      { $match: { ...filter, status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      { $match: { 'ratings.score': { $lte: 5 } } },
      { $count: 'total' }
    ]),
    InspectionTask.aggregate([
      { $match: { ...filter, status: 'COMPLETED' } },
      { $unwind: '$ratings' },
      { $match: { 'ratings.score': 10 } },
      { $count: 'total' }
    ]),
    InspectionTask.findOne({ ...filter, status: 'COMPLETED' }).sort({ updatedAt: -1 }).select('updatedAt')
  ]);

  const progress = total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;
  const totalRatingsCount = paramStats[0]?.total || 0;
  const perfect10Count = avgRatingResult[0]?.total || 0; // avgRatingResult is now used for perfect 10s
  const perfect10Percentage = totalRatingsCount > 0 ? parseFloat(((perfect10Count / totalRatingsCount) * 100).toFixed(2)) : 0;

  const sparklineGen = () => Array.from({ length: 7 }, () => ({ v: Math.floor(Math.random() * 20) + 5 }));
  
  return {
    totalRoads: 1, // Single project
    totalRatings: total, // Fixed: total tasks rather than total parameters evaluated
    completedRatings: completed,
    pendingRatings: total - completed,
    criticalIssues: criticalCount[0]?.total || 0,
    perfect10Percentage: perfect10Percentage,
    monthlyProgress: progress,
    lastUpdated: lastUpdated ? lastUpdated.updatedAt : null,
    sparklines: {
      totalRatings: sparklineGen(),
      completedRatings: sparklineGen(),
      pendingRatings: sparklineGen(),
      criticalIssues: sparklineGen(),
      avgHealthScore: sparklineGen(),
      monthlyProgress: sparklineGen()
    }
  };
};

/**
 * Road Status Distribution for Donut Chart
 */
const getRoadsStatus = async () => {
  return Project.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Category distribution for charts
 */
const getCategoryDistribution = async (projectId, batchId = null) => {
  const filter = { status: 'COMPLETED' };
  if (projectId) filter.project = projectId;
  if (batchId) filter.batchId = mongoose.Types.ObjectId(batchId);

  return InspectionTask.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'masterlists',
        localField: 'parameters',
        foreignField: '_id',
        as: 'masterListParams'
      }
    },
    { $unwind: '$masterListParams' },
    { $group: { _id: '$masterListParams.category', total: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
};

/**
 * Daily rating trend — last N days
 */
const getDailyRatings = async (projectId, days = 30, batchId = null) => {
  const filter = { status: 'COMPLETED' };
  if (projectId) filter.project = projectId;
  if (batchId) filter.batchId = mongoose.Types.ObjectId(batchId);

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));
  filter.updatedAt = { $gte: since };

  return InspectionTask.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } }
  ]);
};

/**
 * Inspector Leaderboard
 */
const getInspectorLeaderboard = async (projectId, limit = 10, batchId = null) => {
  const filter = { status: 'COMPLETED' };
  if (projectId) filter.project = projectId;
  if (batchId) filter.batchId = mongoose.Types.ObjectId(batchId);

  // Assuming approvedBy holds the user ID of the inspector who completed it
  return InspectionTask.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'approvedBy',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          id: '$user._id',
          name: { $concat: [{ $ifNull: ['$user.firstName', 'Unknown'] }, ' ', { $ifNull: ['$user.lastName', 'User'] }] }
        },
        count: { $sum: 1 },
        avgScore: { $avg: { $avg: '$ratings.score' } }
      }
    },
    { $sort: { count: -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        name: '$_id.name',
        completed: '$count',
        avgScore: { $round: ['$avgScore', 1] },
        _id: 0
      }
    }
  ]);
};

/**
 * Recent Activity Timeline
 */
const getRecentActivity = async (projectId, limit = 10) => {
  const filter = { status: 'COMPLETED' };
  if (projectId) filter.project = projectId;

  const tasks = await InspectionTask.find(filter)
    .select('project assetType chainage updatedAt approvedBy ratings parameters')
    .populate('approvedBy', 'firstName lastName')
    .populate('parameters', 'parameter')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .lean();

  return tasks.map((task) => {
    // Pick the lowest rated parameter to show in the activity or the first one
    const sortedRatings = (task.ratings || []).sort((a, b) => a.score - b.score);
    const worstRating = sortedRatings[0];
    const param = (task.parameters || []).find(p => p._id.toString() === worstRating?.masterListId?.toString());

    return {
      id: task._id,
      project: task.project,
      assetType: task.assetType,
      chainage: task.chainage,
      status: 'Rated',
      actor: task.approvedBy ? `${task.approvedBy.firstName} ${task.approvedBy.lastName}` : 'System',
      date: task.updatedAt,
      parameter: param ? param.parameter : 'Inspection',
      score: worstRating ? worstRating.score : 10
    };
  });
};

/**
 * All projects map data & GPS Map Data
 * Returns generic project coordinates if no GPS found, else real GPS points
 */
const getAllProjectsMapData = async (projectId) => {
  if (projectId) {
    // Get actual GPS coordinates from InspectionTasks for the specific project
    const tasks = await InspectionTask.find({ 
      project: projectId, 
      'metadata.latitude': { $exists: true, $ne: null },
      'metadata.longitude': { $exists: true, $ne: null }
    })
      .select('chainage assetType metadata status ratings image')
      .lean();

    if (tasks.length > 0) {
      return {
        type: 'GPS_POINTS',
        points: tasks.map(t => {
          const avgScore = t.ratings?.length ? t.ratings.reduce((sum, r) => sum + r.score, 0) / t.ratings.length : null;
          let health = 'Pending';
          let worstRating = null;
          
          if (t.ratings?.length) {
            worstRating = t.ratings.reduce((min, r) => (r.score < min.score ? r : min), t.ratings[0]);
            
            // Align with KPI: <= 1 is Critical, <= 5 is Needs Attention
            if (worstRating.score <= 1) health = 'Critical';
            else if (worstRating.score <= 5) health = 'Needs Attention';
            else if (worstRating.score < 10) health = 'Good';
            else health = 'Excellent';
          }
          
          let remarks = 'No remarks provided';
          if (worstRating && worstRating.remark) {
            remarks = worstRating.remark;
          }
          
          return {
            id: t._id,
            lat: t.metadata.latitude,
            lng: t.metadata.longitude,
            chainage: t.chainage,
            assetType: t.assetType,
            status: t.status,
            health,
            avgScore,
            score: worstRating ? worstRating.score : null,
            imageUrl: t.image?.cloudinaryUrl || null,
            remarks
          };
        })
      };
    }
  }

  // Fallback to project coordinates
  const projects = await Project.find({ isActive: true })
    .select('code fullName status coordinates')
    .lean();
  
  return {
    type: 'PROJECTS',
    projects
  };
};

/**
 * Additional Chart Endpoints for AnalyticsCharts
 */
const getChartsData = async (projectId, batchId = null) => {
  const filter = { status: 'COMPLETED' };
  if (projectId) filter.project = projectId;
  if (batchId) filter.batchId = mongoose.Types.ObjectId(batchId);

  // Rating Distribution (Donut)
  const donutData = await InspectionTask.aggregate([
    { $match: filter },
    { $unwind: '$ratings' },
    {
      $project: {
        bucket: {
          $switch: {
            branches: [
              { case: { $gte: ['$ratings.score', 8] }, then: 'Excellent' },
              { case: { $gte: ['$ratings.score', 6] }, then: 'Good' },
              { case: { $gte: ['$ratings.score', 4] }, then: 'Needs Attention' }
            ],
            default: 'Critical'
          }
        }
      }
    },
    { $group: { _id: '$bucket', value: { $sum: 1 } } }
  ]).then(res => res.map(r => ({ name: r._id, value: r.value })));

  // Ratings by Project (Bar)
  const barData = await InspectionTask.aggregate([
    { $match: filter },
    { $unwind: '$ratings' },
    { $group: { _id: '$project', ratings: { $sum: 1 } } },
    { $sort: { ratings: -1 } }
  ]).then(res => res.map(r => ({ name: r._id, ratings: r.ratings })));

  // Monthly Rating Trend (Line/Area)
  const lineData = await InspectionTask.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
        val: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).then(res => res.map(r => ({ name: r._id, val: r.val })));

  // Asset Type Analysis (Stacked Bar)
  const stackedData = await InspectionTask.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'masterlists',
        localField: 'parameters',
        foreignField: '_id',
        as: 'masterListParams'
      }
    },
    { $unwind: '$masterListParams' },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
          category: '$masterListParams.category'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.month',
        categories: { $push: { k: '$_id.category', v: '$count' } }
      }
    },
    { $sort: { _id: 1 } }
  ]).then(res => res.map(r => ({ name: r._id, ...Object.fromEntries(r.categories.map(c => [c.k, c.v])) })));

  // Asset Category Treemap
  const treeMapData = await InspectionTask.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'masterlists',
        localField: 'parameters',
        foreignField: '_id',
        as: 'masterListParams'
      }
    },
    { $unwind: '$masterListParams' },
    { $group: { _id: '$masterListParams.category', size: { $sum: 1 } } },
    { $sort: { size: -1 } }
  ]).then(res => res.map(r => ({ name: r._id, size: r.size })));

  // Top Critical Roads (Bar)
  const criticalRoadsData = await InspectionTask.aggregate([
    { $match: filter },
    { $unwind: '$ratings' },
    { $match: { 'ratings.score': { $lte: 5 } } },
    { $group: { _id: '$project', issues: { $sum: 1 } } },
    { $sort: { issues: -1 } },
    { $limit: 10 }
  ]).then(res => res.map(r => ({ name: r._id, issues: r.issues })));

  // Road Health Score (Radial)
  const avgHealth = await InspectionTask.aggregate([
    { $match: filter },
    { $unwind: '$ratings' },
    { $group: { _id: null, avg: { $avg: '$ratings.score' } } }
  ]);
  const radialData = [{ name: 'Health', value: Math.round((avgHealth[0]?.avg || 0) * 10), fill: '#22C55E' }];

  // Rating Comparison (Radar) - comparing avg score per category (Project vs Global)
  const radarData = await InspectionTask.aggregate([
    { $match: { status: 'COMPLETED' } }, // Match all to get both project and global
    {
      $lookup: {
        from: 'masterlists',
        localField: 'parameters',
        foreignField: '_id',
        as: 'masterListParams'
      }
    },
    { $unwind: { path: '$masterListParams', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$ratings', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $expr: { $eq: ['$masterListParams._id', '$ratings.masterListId'] }
      }
    },
    { 
      $group: { 
        _id: '$masterListParams.category', 
        globalAvg: { $avg: '$ratings.score' },
        projectTotalScore: { $sum: { $cond: [{ $eq: ['$project', projectId || ''] }, '$ratings.score', 0] } },
        projectCount: { $sum: { $cond: [{ $eq: ['$project', projectId || ''] }, 1, 0] } }
      } 
    }
  ]).then(res => res.map(r => {
    const projectAvg = r.projectCount > 0 ? (r.projectTotalScore / r.projectCount) : (r.globalAvg || 0);
    return {
      subject: r._id, 
      A: Math.round(projectAvg * 15), 
      B: Math.round((r.globalAvg || 0) * 15), 
      fullMark: 150 
    };
  }));

  // Scatter Plot - Plotting exact chainage (x) vs rating score (y) colored by z
  const scatterData = await InspectionTask.aggregate([
    { $match: filter },
    { $unwind: '$ratings' },
    { $group: { _id: '$_id', chainage: { $first: '$chainage' }, score: { $avg: '$ratings.score' } } },
    { $limit: 100 }
  ]).then((res) => res.map((r, i) => ({ 
    x: parseFloat(r.chainage) || (i * 10), 
    y: Math.round((r.score || 0) * 10), 
    z: 100 
  })));

  return {
    donutData,
    barData,
    lineData,
    stackedData,
    treeMapData,
    criticalRoadsData,
    radialData,
    radarData,
    scatterData
  };
};

/**
 * Skip Analytics
 */
const getSkipAnalytics = async (projectId, batchId = null, filters = {}) => {
  const matchFilter = {
    $or: [
      { status: 'SKIPPED' },
      { 'skippedAssetTypes.0': { $exists: true } }
    ]
  };

  const totalTasksFilter = { status: { $in: ['READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] } };

  if (projectId) {
    matchFilter.project = projectId;
    totalTasksFilter.project = projectId;
  }
  if (batchId) {
    matchFilter.batchId = mongoose.Types.ObjectId(batchId);
    totalTasksFilter.batchId = mongoose.Types.ObjectId(batchId);
  }
  
  if (filters.startDate && filters.endDate) {
    matchFilter.updatedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    totalTasksFilter.updatedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }

  // Pre-filter for asset type if provided (this will be enforced again post-unwind)
  if (filters.assetType) {
    matchFilter.$or = [
      { assetType: filters.assetType, status: 'SKIPPED' },
      { 'skippedAssetTypes.assetType': filters.assetType }
    ];
    totalTasksFilter.assetType = filters.assetType; // approximate for total tasks
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $addFields: {
        skips: {
          $concatArrays: [
            {
              $cond: [
                { $eq: ['$status', 'SKIPPED'] },
                [{
                  assetType: '$assetType',
                  reason: '$skipMetadata.reason',
                  remarks: '$skipMetadata.remarks',
                  skippedBy: '$skipMetadata.skippedBy',
                  skippedAt: { $ifNull: ['$skipMetadata.skippedAt', '$updatedAt'] },
                  isLegacy: true
                }],
                []
              ]
            },
            { $ifNull: ['$skippedAssetTypes', []] }
          ]
        }
      }
    },
    { $unwind: '$skips' }
  ];

  // Apply post-unwind filters
  const postUnwindMatch = {};
  if (filters.reason) postUnwindMatch['skips.reason'] = filters.reason;
  if (filters.inspector) postUnwindMatch['skips.skippedBy'] = mongoose.Types.ObjectId(filters.inspector);
  if (filters.assetType) postUnwindMatch['skips.assetType'] = filters.assetType;

  if (Object.keys(postUnwindMatch).length > 0) {
    pipeline.push({ $match: postUnwindMatch });
  }

  pipeline.push({
    $facet: {
      totalSkipped: [{ $count: 'count' }],
      recentSkips: [
        { $sort: { 'skips.skippedAt': -1, updatedAt: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: 'users',
            localField: 'skips.skippedBy',
            foreignField: '_id',
            as: 'inspector'
          }
        },
        { $unwind: { path: '$inspector', preserveNullAndEmptyArrays: true } }
      ],
      reasonDistribution: [
        { $group: { _id: '$skips.reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      inspectorCounts: [
        {
          $lookup: {
            from: 'users',
            localField: 'skips.skippedBy',
            foreignField: '_id',
            as: 'inspector'
          }
        },
        { $unwind: { path: '$inspector', preserveNullAndEmptyArrays: true } },
        { 
          $group: { 
            _id: { 
              id: '$skips.skippedBy', 
              name: { $concat: ['$inspector.firstName', ' ', '$inspector.lastName'] } 
            }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ],
      projectCounts: [
        { $group: { _id: '$project', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ],
      chainageHotspots: [
        { $group: { _id: { chainage: '$chainage', project: '$project' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 }
      ]
    }
  });

  const [totalTasks, results] = await Promise.all([
    InspectionTask.countDocuments(totalTasksFilter),
    InspectionTask.aggregate(pipeline)
  ]);

  const facet = results[0];
  const totalSkipped = facet.totalSkipped[0]?.count || 0;
  
  // Total assets for Roadway logic in Dashboard skipRate is complex to do accurately with just countDocuments
  // Assuming a rough estimate for total possible assets based on totalTasks:
  const skipRate = totalTasks > 0 ? ((totalSkipped / totalTasks) * 100).toFixed(2) : 0;

  return {
    totalSkipped,
    skipRate,
    reasonDistribution: facet.reasonDistribution.map(r => ({ reason: r._id || 'Unknown', count: r.count })),
    inspectorCounts: facet.inspectorCounts.map(i => ({ inspector: i._id.name || 'System / Unknown', count: i.count })),
    projectCounts: facet.projectCounts.map(p => ({ project: p._id || 'Unknown', count: p.count })),
    recentSkips: facet.recentSkips.map(s => ({
      _id: s._id,
      project: s.project,
      chainage: s.chainage,
      assetType: s.skips.assetType || s.assetType,
      reason: s.skips.reason || 'Unknown',
      remarks: s.skips.remarks || '',
      inspector: s.inspector ? `${s.inspector.firstName} ${s.inspector.lastName}` : 'System',
      timestamp: s.skips.skippedAt || s.updatedAt,
      imageUrl: s.image?.cloudinaryUrl || null
    })),
    chainageHotspots: facet.chainageHotspots.map(h => ({
      x: parseFloat(h._id.chainage) || 0,
      y: h.count,
      project: h._id.project,
      z: 100
    }))
  };
};

module.exports = {
  getExecutiveKPIs,
  getUserKPIs,
  getProjectKPIs,
  getRoadsStatus,
  getCategoryDistribution,
  getDailyRatings,
  getInspectorLeaderboard,
  getRecentActivity,
  getAllProjectsMapData,
  getChartsData,
  getSkipAnalytics
};
