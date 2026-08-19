'use strict';

const Inspection = require('../../../models/Inspection.model');
const InspectionBatch = require('../../../models/InspectionBatch.model');
const InspectionTask = require('../../../models/InspectionTask.model');

class InspectionRepository {
  async aggregateInspections(pipeline) {
    return await Inspection.aggregate(pipeline);
  }

  async aggregateTasks(pipeline) {
    return await InspectionTask.aggregate(pipeline);
  }

  async aggregateBatches(pipeline) {
    return await InspectionBatch.aggregate(pipeline);
  }

  async findBatches(filter = {}) {
    return await InspectionBatch.find(filter).lean();
  }

  async findTasks(filter = {}) {
    return await InspectionTask.find(filter).lean();
  }

  async findInspections(filter = {}) {
    return await Inspection.find(filter).lean();
  }
}

module.exports = new InspectionRepository();
