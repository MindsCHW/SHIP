'use strict';

const mongoose = require('mongoose');

const inspectionTaskSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionBatch',
      required: true,
      index: true
    },
    project: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      trim: true,
      index: true
    },
    direction: {
      type: String,
      trim: true,
      index: true
    },
    assetType: {
      type: String,
      index: true
    },
    assetSubType: {
      type: String,
      trim: true
    },
    roadType: {
      type: String,
      trim: true,
      index: true
    },
    parameters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterList'
    }],
    ratings: [{
      masterListId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterList'
      },
      parameterKey: {
        type: String,
        trim: true
      },
      parameterName: {
        type: String,
        trim: true
      },
      group: {
        type: String,
        trim: true
      },
      score: {
        type: Number,
        default: 10
      },
      remark: {
        type: String,
        trim: true
      }
    }],
    chainage: {
      type: String,
      required: true,
      index: true
    },
    imageRequirement: {
      type: String,
      enum: ['DAY', 'NIGHT'],
      default: 'DAY',
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING_IMAGE', 'READY_FOR_REVIEW', 'READY_FOR_RATING', 'IN_PROGRESS', 'COMPLETED', 'EXTRACTION_FAILED', 'FAILED', 'REJECTED', 'SKIPPED'],
      default: 'PENDING_IMAGE',
      index: true
    },
    imageApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    image: {
      cloudinaryUrl: {
        type: String,
        trim: true
      },
      previousUrl: {
        type: String,
        trim: true
      },
      nextUrl: {
        type: String,
        trim: true
      }
    },
    metadata: {
      latitude: Number,
      longitude: Number,
      speed: Number,
      extractedAt: String
    },
    extractionDiagnostics: {
      surveyAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'SurveyAsset' },
      videoFilename: String,
      coverageStart: Number,
      coverageEnd: Number,
      calculatedTimestamp: String,
      videoDuration: String,
      failureReason: String
    },
    skipMetadata: {
      reason: String,
      remarks: String,
      skippedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      skippedAt: Date
    },
    skippedAssetTypes: [{
      assetType: { type: String, required: true },
      reason: String,
      remarks: String,
      skippedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      skippedAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const InspectionTask = mongoose.model('InspectionTask', inspectionTaskSchema);

module.exports = InspectionTask;
