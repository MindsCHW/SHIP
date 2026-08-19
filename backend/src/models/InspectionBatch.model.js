'use strict';

const mongoose = require('mongoose');

const inspectionBatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    project: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    categories: [{
      type: String,
      trim: true
    }],
    assetTypes: [{
      type: String,
      trim: true
    }],
    samplingPercentage: {
      type: Number,
      required: true
    },
    samplingStrategy: {
      type: String,
      enum: ['RANDOM', 'STRATIFIED', 'CUSTOM', 'CONTINUOUS'],
      default: 'RANDOM'
    },
    totalMasterQuestions: {
      type: Number,
      default: 0
    },
    selectedQuestionsCount: {
      type: Number,
      default: 0
    },
    uniqueChainagesCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['WAITING_FOR_IMAGES', 'PROCESSING', 'READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'WAITING_FOR_IMAGES',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    reviewCompleted: {
      type: Boolean,
      default: false
    },
    isSamplingHistoryReset: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const InspectionBatch = mongoose.model('InspectionBatch', inspectionBatchSchema);

module.exports = InspectionBatch;
