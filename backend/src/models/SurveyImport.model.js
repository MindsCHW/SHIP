'use strict';

const mongoose = require('mongoose');

const surveyImportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    filename: {
      type: String,
      trim: true
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed // Raw Survey Processor JSON
    },
    inspectionsGenerated: {
      type: Number,
      default: 0
    },
    inspectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inspection'
      }
    ],
    errorMessages: [{ type: String }],
    processingTimeMs: { type: Number }
  },
  {
    timestamps: true
  }
);

surveyImportSchema.index({ projectId: 1, createdAt: -1 });

const SurveyImport = mongoose.model('SurveyImport', surveyImportSchema);

module.exports = SurveyImport;
