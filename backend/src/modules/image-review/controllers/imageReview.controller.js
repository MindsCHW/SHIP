'use strict';

const imageReviewService = require('../services/imageReview.service');

exports.getBatchesForReview = async (req, res, next) => {
  try {
    const batches = await imageReviewService.getBatchesForReview();
    res.status(200).json({ success: true, data: batches });
  } catch (err) {
    next(err);
  }
};

exports.getBatchTasks = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const tasks = await imageReviewService.getBatchTasks(batchId);
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const task = await imageReviewService.updateTaskStatus(taskId, status, req.user.id);
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.approveBatch = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const batch = await imageReviewService.approveBatch(batchId, req.user.id);
    res.status(200).json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

exports.rejectBatch = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const batch = await imageReviewService.rejectBatch(batchId);
    res.status(200).json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};
