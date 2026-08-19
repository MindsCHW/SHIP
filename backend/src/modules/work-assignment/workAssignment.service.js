'use strict';

const WorkAssignment = require('../../models/WorkAssignment.model');
const InspectionBatch = require('../../models/InspectionBatch.model');
const InspectionTask = require('../../models/InspectionTask.model');
const User = require('../../models/User.model');
const notificationService = require('../notifications/notification.service');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');

// ─── Helper: fire assignment notification ────────────────────────────────────
const fireNotification = async (type, toUserId, batchName, assignmentId) => {
  const typeMap = {
    BATCH_ASSIGNED:    { title: `New Batch Assigned: ${batchName}`, body: 'You have a new inspection batch ready for rating.', notifType: 'INFO' },
    BATCH_STARTED:     { title: `Rating Started: ${batchName}`,     body: 'An inspector has started rating this batch.',          notifType: 'INFO' },
    BATCH_COMPLETED:   { title: `Rating Completed: ${batchName}`,   body: 'Rating has been completed for this batch.',             notifType: 'SUCCESS' },
    BATCH_REASSIGNED:  { title: `Batch Reassigned: ${batchName}`,   body: 'This inspection batch has been reassigned to you.',    notifType: 'WARNING' },
    DUE_DATE_REMINDER: { title: `Due Soon: ${batchName}`,           body: 'Your assignment is due within 24 hours.',              notifType: 'WARNING' },
  };
  const meta = typeMap[type];
  if (!meta || !toUserId) return;
  await notificationService.send(toUserId, {
    title: meta.title,
    body: meta.body,
    type: meta.notifType,
    link: `/notifications?assignment=${assignmentId}`,
    relatedResource: 'WorkAssignment',
    relatedResourceId: String(assignmentId)
  });
};

// ─── Helper: parse pages string and return task IDs ──────────────────────────────
const getTaskIdsForPages = async (batchId, pagesStr) => {
  if (!pagesStr) return [];
  const cleanStr = pagesStr.replace(/[^0-9,-]/g, ''); // e.g. "1-15" or "2"
  if (!cleanStr) return [];
  
  const tasks = await InspectionTask.find({ batchId }).sort({ chainage: 1 }).select('_id').lean();
  if (tasks.length === 0) return [];
  
  const parts = cleanStr.split('-');
  let startIdx = parseInt(parts[0], 10) - 1;
  let endIdx = parts.length > 1 && parts[1] ? parseInt(parts[1], 10) - 1 : startIdx;
  
  if (isNaN(startIdx) || startIdx < 0) startIdx = 0;
  if (isNaN(endIdx) || endIdx >= tasks.length) endIdx = tasks.length - 1;
  
  return tasks.slice(startIdx, endIdx + 1).map(t => t._id);
};

// ─── Create single assignment ─────────────────────────────────────────────────
const createAssignment = async (data, adminUser) => {
  const mongoose = require('mongoose');

  // Enforce strict required fields
  if (!data.pages) throw Object.assign(new Error('Pages (Sub Section) is required'), { statusCode: 400 });
  if (!data.dueDate) throw Object.assign(new Error('Due Date is required'), { statusCode: 400 });
  
  let batch;
  if (mongoose.Types.ObjectId.isValid(data.batchId)) {
    batch = await InspectionBatch.findById(data.batchId);
  }
  if (!batch) {
    batch = await InspectionBatch.findOne({ project: data.batchId, status: { $in: ['READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'] } }).sort({ createdAt: -1 });
  }
  if (!batch) throw Object.assign(new Error('No in-progress batch found for this project'), { statusCode: 404 });

  const inspector = await User.findById(data.assignedTo);
  if (!inspector) throw Object.assign(new Error('Inspector not found'), { statusCode: 404 });

  const questionIds = await getTaskIdsForPages(batch._id, data.pages);

  const assignment = await WorkAssignment.create({
    batchId: batch._id,
    batchName: batch.name,
    project: batch.project,
    assignedTo: data.assignedTo,
    assignedBy: adminUser._id,
    priority: data.priority || 'Medium',
    dueDate: data.dueDate,
    remarks: data.remarks || '',
    category: data.category || 'Roadway',
    pages: data.pages,
    questionIds: questionIds,
    status: 'Assigned',
    isBulk: false,
    timeline: [{
      action: 'Assigned by Administrator',
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      timestamp: new Date(),
      remarks: data.remarks || ''
    }]
  });

  await fireNotification('BATCH_ASSIGNED', data.assignedTo, batch.name, assignment._id);
  return assignment.populate(['assignedTo', 'assignedBy', 'batchId']);
};

// ─── Bulk assign — same batch to multiple inspectors ─────────────────────────
const bulkAssign = async (data, adminUser) => {
  const mongoose = require('mongoose');

  if (!data.dueDate) throw Object.assign(new Error('Due Date is required'), { statusCode: 400 });
  if (!data.assignments || !Array.isArray(data.assignments)) {
    throw Object.assign(new Error('assignments array is required for bulk assign'), { statusCode: 400 });
  }

  let batch;
  if (mongoose.Types.ObjectId.isValid(data.batchId)) {
    batch = await InspectionBatch.findById(data.batchId);
  }
  if (!batch) {
    batch = await InspectionBatch.findOne({ project: data.batchId, status: { $in: ['READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'] } }).sort({ createdAt: -1 });
  }
  if (!batch) throw Object.assign(new Error('No in-progress batch found for this project'), { statusCode: 404 });

  const assignments = await Promise.all(
    data.assignments.map(async (assignmentData) => {
      if (!assignmentData.pages) throw Object.assign(new Error('Pages is required for each bulk assignment'), { statusCode: 400 });
      
      const questionIds = await getTaskIdsForPages(batch._id, assignmentData.pages);
      
      const assignment = await WorkAssignment.create({
        batchId: batch._id,
        batchName: batch.name,
        project: batch.project,
        assignedTo: assignmentData.userId,
        assignedBy: adminUser._id,
        priority: data.priority || 'Medium',
        dueDate: data.dueDate,
        remarks: data.remarks || '',
        category: data.category || 'Roadway',
        pages: assignmentData.pages,
        questionIds: questionIds,
        status: 'Assigned',
        isBulk: true,
        timeline: [{
          action: 'Assigned by Administrator (Bulk)',
          performedBy: adminUser._id,
          performedByName: adminUser.name,
          timestamp: new Date(),
          remarks: `Bulk assignment of batch "${batch.name}" (${assignmentData.pages}).`
        }]
      });
      await fireNotification('BATCH_ASSIGNED', assignmentData.userId, batch.name, assignment._id);
      return assignment;
    })
  );

  return assignments;
};

// ─── Get all assignments (Admin) ──────────────────────────────────────────────
const getAssignments = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.project) filter.project = query.project;
  if (query.status) filter.status = query.status;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.priority) filter.priority = query.priority;

  const [assignments, total] = await Promise.all([
    WorkAssignment.find(filter)
      .populate('assignedTo', 'name email username role')
      .populate('assignedBy', 'name')
      .populate('batchId', 'name status uniqueChainagesCount selectedQuestionsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WorkAssignment.countDocuments(filter)
  ]);

  return { assignments, pagination: buildPaginationMeta(total, page, limit) };
};

// ─── Get my assignments (Inspector) ──────────────────────────────────────────
const getMyAssignments = async (userId) => {
  return WorkAssignment.find({ assignedTo: userId })
    .populate('batchId', 'name status project uniqueChainagesCount selectedQuestionsCount')
    .populate('assignedBy', 'name')
    .sort({ createdAt: -1 });
};

// ─── Update assignment status (Inspector or Admin) ────────────────────────────
const updateStatus = async (id, status, user) => {
  const assignment = await WorkAssignment.findById(id).populate('batchId', 'name');
  if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });

  const prevStatus = assignment.status;
  assignment.status = status;

  const timelineActions = {
    'In Progress': 'Rating Started by Inspector',
    'Completed':   'Rating Completed by Inspector',
    'Overdue':     'Marked Overdue by System'
  };

  assignment.timeline.push({
    action: timelineActions[status] || `Status changed to ${status}`,
    performedBy: user._id,
    performedByName: user.name,
    timestamp: new Date(),
    remarks: ''
  });

  await assignment.save();

  // Fire notification to admin (assignedBy)
  if (status === 'In Progress') {
    await fireNotification('BATCH_STARTED', assignment.assignedBy, assignment.batchName, assignment._id);
  } else if (status === 'Completed') {
    await fireNotification('BATCH_COMPLETED', assignment.assignedBy, assignment.batchName, assignment._id);
  }

  return assignment;
};

// ─── Edit assignment (Admin) ──────────────────────────────────────────────────
const editAssignment = async (id, data, adminUser) => {
  const assignment = await WorkAssignment.findById(id);
  if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });

  const changedFields = [];
  if (data.priority && data.priority !== assignment.priority) changedFields.push(`Priority: ${assignment.priority} → ${data.priority}`);
  if (data.dueDate && data.dueDate !== assignment.dueDate?.toISOString()) changedFields.push('Due Date');
  if (data.remarks !== undefined && data.remarks !== assignment.remarks) changedFields.push('Remarks');
  if (data.assignedTo && String(data.assignedTo) !== String(assignment.assignedTo)) {
    changedFields.push('Reassigned Inspector');
    await fireNotification('BATCH_REASSIGNED', data.assignedTo, assignment.batchName, assignment._id);
  }

  Object.assign(assignment, {
    priority: data.priority || assignment.priority,
    dueDate: data.dueDate || assignment.dueDate,
    remarks: data.remarks !== undefined ? data.remarks : assignment.remarks,
    assignedTo: data.assignedTo || assignment.assignedTo
  });

  assignment.timeline.push({
    action: 'Edited by Administrator',
    performedBy: adminUser._id,
    performedByName: adminUser.name,
    timestamp: new Date(),
    remarks: changedFields.length > 0 ? `Updated: ${changedFields.join(', ')}` : 'No significant changes'
  });

  await assignment.save();
  return assignment.populate(['assignedTo', 'assignedBy', 'batchId']);
};

// ─── Delete assignment ────────────────────────────────────────────────────────
const deleteAssignment = async (id) => {
  const assignment = await WorkAssignment.findByIdAndDelete(id);
  if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });
  return assignment;
};

// ─── Get timeline for drawer ──────────────────────────────────────────────────
const getTimeline = async (id) => {
  const assignment = await WorkAssignment.findById(id)
    .select('timeline batchName assignedTo')
    .populate('assignedTo', 'name');
  if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });
  return assignment;
};

// ─── Get in-progress batches for assignment ──────────────────────────────────
const getBatchesReady = async (project) => {
  const filter = { status: { $in: ['READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS'] } };
  if (project) filter.project = project;
  return InspectionBatch.find(filter)
    .select('name project status uniqueChainagesCount selectedQuestionsCount category createdAt')
    .sort({ createdAt: -1 });
};

// ─── Mark overdue assignments (called by cron) ────────────────────────────────
const markOverdueAssignments = async () => {
  const now = new Date();
  const overdueAssignments = await WorkAssignment.find({
    status: { $in: ['Assigned', 'In Progress'] },
    dueDate: { $lt: now }
  });

  for (const assignment of overdueAssignments) {
    assignment.status = 'Overdue';
    assignment.timeline.push({
      action: 'Auto-marked Overdue by System',
      performedByName: 'System',
      timestamp: now,
      remarks: 'Due date has passed.'
    });
    await assignment.save();
  }
};

// ─── Send due date reminders (called by cron — 24hr before) ──────────────────
const sendDueDateReminders = async () => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcoming = await WorkAssignment.find({
    status: { $in: ['Assigned', 'In Progress'] },
    dueDate: { $gte: now, $lte: in24h }
  });

  for (const assignment of upcoming) {
    await fireNotification('DUE_DATE_REMINDER', assignment.assignedTo, assignment.batchName, assignment._id);
  }
};

// ─── Assignment stats for dashboard ──────────────────────────────────────────
const getAssignmentStats = async (project) => {
  const filter = {};
  if (project) filter.project = project;

  const result = await WorkAssignment.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const stats = { Assigned: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
  result.forEach(r => { stats[r._id] = r.count; });
  return stats;
};

module.exports = {
  createAssignment, bulkAssign, getAssignments, getMyAssignments,
  updateStatus, editAssignment, deleteAssignment, getTimeline,
  getBatchesReady, markOverdueAssignments, sendDueDateReminders, getAssignmentStats
};
