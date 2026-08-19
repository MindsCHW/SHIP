'use strict';

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    fullName: {
      type: String,
      required: [true, 'Project full name is required'],
      trim: true
    },
    client: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    highway: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['ON-GOING', 'HO-PROCESS', 'HO-RATED', 'SPV-RATED', 'NOT-RATED'],
        message: 'Invalid status'
      },
      default: 'NOT-RATED'
    },
    reportedBy: {
      type: String,
      trim: true
    },
    dateCreated: {
      type: String
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    totalLength: {
      type: Number, // km
      min: 0
    },
    startChainage: {
      type: String,
      trim: true
    },
    endChainage: {
      type: String,
      trim: true
    },
    assignedSPV: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedHO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ isActive: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
