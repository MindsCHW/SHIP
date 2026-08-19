'use strict';

const mongoose = require('mongoose');

const masterListSchema = new mongoose.Schema(
  {
    project: {
      type: String,
      required: [true, 'Project is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    assetType: {
      type: String,
      required: [true, 'Asset Type is required'],
      trim: true,
      index: true
    },
    assetSubType: {
      type: String,
      trim: true
    },
    roadType: {
      type: String,
      required: [true, 'Road Type is required'],
      trim: true
    },
    direction: {
      type: String,
      enum: ['LHS', 'RHS', 'Both', 'N/A'],
      default: 'N/A'
    },
    placement: {
      type: String,
      trim: true
    },
    chainage: {
      type: String,
      trim: true,
      index: true
    },
    parameter: {
      type: String,
      required: [true, 'Parameter/Question text is required'],
      trim: true
    },
    questionId: {
      type: String,
      required: [true, 'Question ID is required'],
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    },
    imageRequirement: {
      type: String,
      enum: ['DAY', 'NIGHT'],
      default: 'DAY',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const MasterList = mongoose.model('MasterList', masterListSchema);

module.exports = MasterList;
