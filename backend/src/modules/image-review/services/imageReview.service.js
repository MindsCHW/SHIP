'use strict';

const InspectionBatch = require('../../../models/InspectionBatch.model');
const InspectionTask = require('../../../models/InspectionTask.model');

class ImageReviewService {
  async getBatchesForReview() {
    return InspectionBatch.find({ status: { $in: ['READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'] } })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getBatchTasks(batchId) {
    return InspectionTask.find({ batchId })
      .populate('parameters')
      .sort({ chainage: 1 });
  }

  async updateTaskStatus(taskId, status, userId) {
    const task = await InspectionTask.findById(taskId);
    if (!task) throw new Error('Task not found');

    if (status === 'READY_FOR_RATING') {
      task.imageApproved = true;
    } else {
      task.imageApproved = false;
    }

    task.status = status;
    task.approvedBy = userId;
    task.approvedAt = new Date();
    
    await task.save();
    return task;
  }

  async approveBatch(batchId, userId) {
    const batch = await InspectionBatch.findById(batchId);
    if (!batch) throw new Error('Batch not found');

    if (!['READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED'].includes(batch.status)) {
      throw new Error(`Batch cannot be approved in status: ${batch.status}`);
    }

    const tasks = await InspectionTask.find({ batchId });
    // Only consider tasks that have an actual image
    const tasksWithImages = tasks.filter(t => t.image && t.image.cloudinaryUrl && t.image.cloudinaryUrl.trim() !== '');
    
    // Move batch to READY_FOR_RATING, unless it's already IN_PROGRESS or COMPLETED
    if (batch.status === 'READY_FOR_REVIEW') {
      batch.status = 'READY_FOR_RATING';
    }
    batch.approvedBy = userId;
    batch.approvedAt = new Date();
    batch.reviewCompleted = true;
    await batch.save();

    // Ensure all newly extracted tasks with images are approved and correctly marked
    await InspectionTask.updateMany(
      { batchId, status: 'READY_FOR_REVIEW', 'image.cloudinaryUrl': { $exists: true, $ne: '' } },
      { $set: { 
          status: 'READY_FOR_RATING',
          imageApproved: true,
          approvedBy: userId,
          approvedAt: new Date()
        } 
      }
    );

    return batch;
  }

  async rejectBatch(batchId) {
    const batch = await InspectionBatch.findById(batchId);
    if (!batch) throw new Error('Batch not found');

    batch.status = 'FAILED';
    await batch.save();
    return batch;
  }
}

module.exports = new ImageReviewService();
