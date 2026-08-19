'use strict';

const mongoose = require('mongoose');

// Sub-schema for image metadata
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number },
    height: { type: Number }
  },
  { _id: false }
);

// Sub-schema for individual parameter rating (HO or SPV)
const parameterRatingSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      enum: {
        values: [null, 0, 1, 5, 10],
        message: 'Rating must be 0, 1, 5, or 10'
      },
      default: null
    },
    remark: {
      type: String,
      trim: true,
      default: ''
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: {
      type: Date
    }
  },
  { _id: false }
);

// Sub-schema for one parameter entry
const parameterSchema = new mongoose.Schema(
  {
    parameter: {
      type: String,
      required: true,
      trim: true
    },
    question: {
      type: String,
      trim: true
    },
    hoRating: {
      type: parameterRatingSchema,
      default: () => ({})
    },
    spvRating: {
      type: parameterRatingSchema,
      default: () => ({})
    }
  },
  { _id: false }
);

// Sub-schema for header remarks
const headerRemarksSchema = new mongoose.Schema(
  {
    category: { type: String, default: '' },
    assetType: { type: String, default: '' },
    direction: { type: String, default: '' },
    roadType: { type: String, default: '' },
    placement: { type: String, default: '' },
    chainage: { type: String, default: '' }
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    surveyImportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SurveyImport'
    },
    chainage: {
      type: String,
      required: [true, 'Chainage is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
      enum: [
        'Roadway',
        'Road Signage and Furniture',
        'Project Facilities',
        'Structures',
        'ATMS',
        'TMS',
        'Landscaping'
      ]
    },
    assetType: {
      type: String,
      required: [true, 'Asset type is required'],
      trim: true,
      index: true
    },
    roadType: {
      type: String,
      trim: true,
      enum: ['MCW', 'SR', 'N/A'],
      index: true
    },
    direction: {
      type: String,
      trim: true,
      enum: ['LHS', 'RHS', 'Both', 'N/A']
    },
    placement: {
      type: String,
      trim: true
    },
    typeOfWork: {
      type: String,
      enum: ['Maintenance', 'Operations'],
      default: 'Maintenance'
    },
    // Special fields for specific categories
    assetId: {
      type: String,
      trim: true
    },
    laneType: {
      type: String,
      trim: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    // Cloudinary image
    image: {
      type: imageSchema
    },
    additionalImages: {
      type: [imageSchema],
      default: []
    },
    // Dynamic parameters from Rule Engine
    parameters: {
      type: [parameterSchema],
      default: []
    },
    // Header remarks from inspector
    headerRemarks: {
      type: headerRemarksSchema,
      default: () => ({})
    },
    // Aggregated status
    hoStatus: {
      type: String,
      enum: ['PENDING', 'RATED'],
      default: 'PENDING',
      index: true
    },
    spvStatus: {
      type: String,
      enum: ['PENDING', 'RATED'],
      default: 'PENDING',
      index: true
    },
    // GPS/Survey data
    latitude: { type: Number },
    longitude: { type: Number },
    timestamp: { type: String },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reporterName: {
      type: String,
      trim: true
    },
    date: {
      type: String // Formatted display date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for common query patterns
inspectionSchema.index({ projectId: 1, category: 1 });
inspectionSchema.index({ projectId: 1, chainage: 1 });
inspectionSchema.index({ projectId: 1, hoStatus: 1 });
inspectionSchema.index({ projectId: 1, spvStatus: 1 });
inspectionSchema.index({ projectId: 1, category: 1, direction: 1, roadType: 1 });

const Inspection = mongoose.model('Inspection', inspectionSchema);

module.exports = Inspection;
