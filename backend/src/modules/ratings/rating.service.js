'use strict';

const Inspection = require('../../models/Inspection.model');
const mongoose = require('mongoose');

const toObjectId = (id) => mongoose.Types.ObjectId.createFromHexString(id);

/**
 * Gets all ratings for a project with version filter
 */
const getProjectRatings = async (projectId, query = {}) => {
  const filter = { projectId: toObjectId(projectId) };
  if (query.hoStatus) filter.hoStatus = query.hoStatus;
  if (query.category) filter.category = query.category;

  const inspections = await Inspection.find(filter)
    .select('chainage category assetType direction roadType parameters hoStatus spvStatus date reporterName')
    .sort({ chainage: 1 })
    .lean();

  return inspections;
};

/**
 * Computes overall rating for an inspection (weighted average)
 */
const computeOverallRating = async (inspectionId) => {
  const inspection = await Inspection.findById(inspectionId).lean();
  if (!inspection) throw Object.assign(new Error('Inspection not found'), { statusCode: 404 });

  const hoRatings = inspection.parameters
    .map((p) => p.hoRating?.value)
    .filter((v) => v !== null && v !== undefined);

  const spvRatings = inspection.parameters
    .map((p) => p.spvRating?.value)
    .filter((v) => v !== null && v !== undefined);

  const hoAvg = hoRatings.length
    ? parseFloat((hoRatings.reduce((a, b) => a + b, 0) / hoRatings.length).toFixed(2))
    : null;

  const spvAvg = spvRatings.length
    ? parseFloat((spvRatings.reduce((a, b) => a + b, 0) / spvRatings.length).toFixed(2))
    : null;

  return { inspectionId, hoAvg, spvAvg, hoRatedCount: hoRatings.length, spvRatedCount: spvRatings.length };
};

/**
 * Gets rating summary grouped by category for a project
 */
const getRatingSummary = async (projectId) => {
  return Inspection.aggregate([
    { $match: { projectId: toObjectId(projectId) } },
    { $unwind: { path: '$parameters', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$category',
        avgHORating: { $avg: '$parameters.hoRating.value' },
        avgSPVRating: { $avg: '$parameters.spvRating.value' },
        totalParameters: { $sum: 1 },
        critical: { $sum: { $cond: [{ $lte: ['$parameters.hoRating.value', 1] }, 1, 0] } }
      }
    },
    {
      $project: {
        category: '$_id',
        avgHORating: { $round: ['$avgHORating', 2] },
        avgSPVRating: { $round: ['$avgSPVRating', 2] },
        totalParameters: 1,
        critical: 1,
        _id: 0
      }
    },
    { $sort: { avgHORating: 1 } }
  ]);
};

/**
 * Gets version history — all rated inspections for a project grouped by month
 */
const getVersionHistory = async (projectId) => {
  return Inspection.aggregate([
    { $match: { projectId: toObjectId(projectId), hoStatus: 'RATED' } },
    {
      $group: {
        _id: { $dateToString: { format: '%b %y', date: '$updatedAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $project: { version: '$_id', count: 1, _id: 0 } }
  ]);
};

const InspectionBatch = require('../../models/InspectionBatch.model');
const InspectionTask = require('../../models/InspectionTask.model');

/**
 * Gets batches ready for rating, with the count of ratable tasks (those with images)
 */
const getReadyBatches = async (user) => {
  let batchQuery = { status: { $in: ['READY_FOR_RATING', 'IN_PROGRESS'] } };
  
  if (user && user.role === 'User') {
    const WorkAssignment = require('../../models/WorkAssignment.model');
    const userAssignments = await WorkAssignment.find({
      assignedTo: user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });
    
    if (userAssignments.length === 0) {
      return [];
    }
    
    const assignedBatchIds = userAssignments.map(a => a.batchId);
    batchQuery._id = { $in: assignedBatchIds };
  }

  const batches = await InspectionBatch.find(batchQuery)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'firstName lastName email')
    .lean();

  // For each batch, compute how many tasks actually have images ready for rating
  const batchesWithCounts = await Promise.all(batches.map(async (batch) => {
    const ratableTaskCount = await InspectionTask.countDocuments({
      batchId: batch._id,
      status: { $nin: ['EXTRACTION_FAILED', 'PENDING_IMAGE'] },
      'image.cloudinaryUrl': { $exists: true, $ne: null, $ne: '' }
    });
    return {
      ...batch,
      ratableTaskCount
    };
  }));

  return batchesWithCounts;
};

const WorkAssignment = require('../../models/WorkAssignment.model');

/**
 * Gets tasks for a batch that are ready for rating (have actual images)
 * Also attaches previous and next images for contextual display.
 * Implements RBAC: 'User' role only sees their assigned tasks.
 */
const getBatchTasks = async (batchId, user) => {
  let queryFilter = {
    batchId,
    status: { $nin: ['EXTRACTION_FAILED', 'PENDING_IMAGE'] },
    $and: [
      { 'image.cloudinaryUrl': { $exists: true } },
      { 'image.cloudinaryUrl': { $ne: null } },
      { 'image.cloudinaryUrl': { $ne: '' } }
    ]
  };

  // If user is a 'User', restrict to their assignment
  if (user && user.role === 'User') {
    const assignment = await WorkAssignment.findOne({
      batchId,
      assignedTo: user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });
    
    if (!assignment) {
      // Return empty if no active assignment
      return [];
    }

    // Update assignment status to In Progress if it was just Assigned
    if (assignment.status === 'Assigned') {
      assignment.status = 'In Progress';
      assignment.startedTime = new Date();
      await assignment.save();
    }

    if (assignment.questionIds && assignment.questionIds.length > 0) {
      queryFilter._id = { $in: assignment.questionIds };
    }
  }

  const tasks = await InspectionTask.find(queryFilter)
    .populate('parameters')
    .sort({ chainage: 1 })
    .lean();
    
  if (!tasks.length) return tasks;

  // Retrieve project-wide images to find nearest context (previous/next)
  const projectId = tasks[0].project;
  
  const allProjectImages = await InspectionTask.find({
    project: projectId,
    'image.cloudinaryUrl': { $exists: true, $ne: null, $ne: '' }
  })
    .select('chainage image')
    .lean();

  // Parse chainages to float and sort for accurate nearest-neighbor matching
  const sortedImages = allProjectImages
    .map(img => ({ ...img, numericChainage: parseFloat(img.chainage) }))
    .filter(img => !isNaN(img.numericChainage))
    .sort((a, b) => a.numericChainage - b.numericChainage);

  // Attach previous and next images
  const tasksWithContext = tasks.map(task => {
    const taskChainage = parseFloat(task.chainage);
    if (isNaN(taskChainage)) return task;

    let prevImage = null;
    let nextImage = null;

    // Find nearest less than current
    for (let i = sortedImages.length - 1; i >= 0; i--) {
      if (sortedImages[i].numericChainage < taskChainage) {
        prevImage = sortedImages[i];
        break;
      }
    }

    // Find nearest greater than current
    for (let i = 0; i < sortedImages.length; i++) {
      if (sortedImages[i].numericChainage > taskChainage) {
        nextImage = sortedImages[i];
        break;
      }
    }

    return {
      ...task,
      previousImage: prevImage ? { url: prevImage.image.cloudinaryUrl, chainage: prevImage.chainage } : null,
      nextImage: nextImage ? { url: nextImage.image.cloudinaryUrl, chainage: nextImage.chainage } : null
    };
  });
  
  return tasksWithContext;
};

/**
 * Saves ratings for a task (chainage)
 */
const saveTaskRatings = async (taskId, ratingsData, selectedImageUrl, user) => {
  const task = await InspectionTask.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });

  // RBAC: If user is 'User', verify they are assigned this task
  if (user && user.role === 'User') {
    const assignment = await WorkAssignment.findOne({
      batchId: task.batchId,
      assignedTo: user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });

    if (!assignment) {
      throw Object.assign(new Error('Forbidden: No active assignment for this batch'), { statusCode: 403 });
    }

    if (assignment.questionIds && assignment.questionIds.length > 0) {
      const isAssigned = assignment.questionIds.some(qId => qId.toString() === taskId.toString());
      if (!isAssigned) {
        throw Object.assign(new Error('Forbidden: You are not assigned to rate this specific task'), { statusCode: 403 });
      }
    }
  }

  task.ratings = ratingsData;
  if (selectedImageUrl) {
    if (!task.image) task.image = {};
    task.image.cloudinaryUrl = selectedImageUrl;
  }
  task.status = 'COMPLETED'; // Or 'RATED' based on the workflow
  await task.save();

  // Check if batch is completed
  const remainingTasks = await InspectionTask.countDocuments({ 
    batchId: task.batchId, 
    status: { $ne: 'COMPLETED' } 
  });

  if (remainingTasks === 0) {
    const batch = await InspectionBatch.findById(task.batchId);
    if (batch) {
      batch.status = 'COMPLETED';
      await batch.save();
    }
    
    // Also mark assignment as completed if user is a 'User'
    if (user && user.role === 'User') {
       await WorkAssignment.updateMany(
         { batchId: task.batchId, status: { $in: ['Assigned', 'In Progress'] } },
         { $set: { status: 'Completed', completedTime: new Date() } }
       );
    }
  } else {
    // If it was READY_FOR_RATING, move to IN_PROGRESS
    const batch = await InspectionBatch.findById(task.batchId);
    if (batch && batch.status === 'READY_FOR_RATING') {
      batch.status = 'IN_PROGRESS';
      await batch.save();
    }
  }

  return task;
};

/**
 * Export completed ratings to CSV
 */
const exportRatingsCSV = async (projectId, batchId) => {
  const query = { 
    project: projectId, 
    status: 'COMPLETED' 
  };
  
  if (batchId) {
    query.batchId = batchId;
  }

  const tasks = await InspectionTask.find(query)
    .populate('parameters')
    .sort({ chainage: 1 });

  const headers = ['ASSET ID', 'PROJECT', 'CATEGORY', 'ASSET TYPE', 'CHAINAGE', 'DIRECTION', 'PARAMETER', 'SCORE', 'REMARK', 'IMAGE URL', 'RATED AT'];
  const rows = [];
  rows.push(headers.join(','));

  tasks.forEach(task => {
    const assetId = (task._id || '').toString().slice(-6).toUpperCase();
    const aType = task.assetSubType ? `${task.assetType} (${task.assetSubType})` : (task.assetType || '-');
    const project = task.project || '-';
    const chainage = task.chainage || '-';
    const imageUrl = task.image?.cloudinaryUrl || '-';
    const ratedAt = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-GB') : '-';

    if (task.ratings && task.ratings.length > 0) {
      task.ratings.forEach(rating => {
        let category = '-';
        let paramText = '-';
        let direction = '-';

        if (rating.masterListId) {
          const param = task.parameters.find(p => p._id.toString() === rating.masterListId.toString());
          category = param ? param.category : '-';
          paramText = param ? param.parameter : '-';
          direction = param && param.direction ? param.direction : '-';
        } else if (rating.parameterKey) {
          category = task.assetType || 'Roadway';
          paramText = rating.parameterName || rating.parameterKey;
          direction = task.direction || '-';
        }
        
        const row = [
          `"${assetId}"`,
          `"${project}"`,
          `"${category}"`,
          `"${aType}"`,
          `"${chainage}"`,
          `"${direction}"`,
          `"${paramText.replace(/"/g, '""')}"`,
          `"${rating.score}"`,
          `"${(rating.remark || '').replace(/"/g, '""')}"`,
          `"${imageUrl}"`,
          `"${ratedAt}"`
        ];
        rows.push(row.join(','));
      });
    }
  });

  return rows.join('\n');
};

/**
 * Skips a task (chainage) with a reason
 */
const skipTask = async (taskId, skipData, user) => {
  const task = await InspectionTask.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });

  // RBAC: If user is 'User', verify they are assigned this task
  if (user && user.role === 'User') {
    const assignment = await WorkAssignment.findOne({
      batchId: task.batchId,
      assignedTo: user._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });

    if (!assignment) {
      throw Object.assign(new Error('Forbidden: No active assignment for this batch'), { statusCode: 403 });
    }

    if (assignment.questionIds && assignment.questionIds.length > 0) {
      const isAssigned = assignment.questionIds.some(qId => qId.toString() === taskId.toString());
      if (!isAssigned) {
        throw Object.assign(new Error('Forbidden: You are not assigned to rate this specific task'), { statusCode: 403 });
      }
    }
  }

  if (!skipData.reason) {
    throw Object.assign(new Error('Skip reason is required'), { statusCode: 400 });
  }

  if (skipData.reason === 'Other' && !skipData.remarks) {
    throw Object.assign(new Error('Remarks are required when skip reason is "Other"'), { statusCode: 400 });
  }

  task.status = 'SKIPPED';
  task.skipMetadata = {
    reason: skipData.reason,
    remarks: skipData.remarks || '',
    skippedBy: user._id,
    skippedAt: new Date()
  };
  await task.save();

  // Check if batch is completed
  const remainingTasks = await InspectionTask.countDocuments({ 
    batchId: task.batchId, 
    status: { $nin: ['COMPLETED', 'SKIPPED'] } 
  });

  if (remainingTasks === 0) {
    const batch = await InspectionBatch.findById(task.batchId);
    if (batch) {
      batch.status = 'COMPLETED';
      await batch.save();
    }
    
    // Also mark assignment as completed if user is a 'User'
    if (user && user.role === 'User') {
       await WorkAssignment.updateMany(
         { batchId: task.batchId, status: { $in: ['Assigned', 'In Progress'] } },
         { $set: { status: 'Completed', completedTime: new Date() } }
       );
    }
  } else {
    // If it was READY_FOR_RATING, move to IN_PROGRESS
    const batch = await InspectionBatch.findById(task.batchId);
    if (batch && batch.status === 'READY_FOR_RATING') {
      batch.status = 'IN_PROGRESS';
      await batch.save();
    }
  }

  return task;
};

module.exports = { getProjectRatings, computeOverallRating, getRatingSummary, getVersionHistory, getReadyBatches, getBatchTasks, saveTaskRatings, skipTask, exportRatingsCSV };
