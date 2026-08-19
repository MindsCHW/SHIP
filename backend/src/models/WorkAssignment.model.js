'use strict';

const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String, trim: true }
}, { _id: false });

const workAssignmentSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionBatch',
      required: true,
      index: true
    },
    batchName: {
      type: String,
      trim: true
    },
    project: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Assigned', 'In Progress', 'Completed', 'Overdue'],
      default: 'Assigned',
      index: true
    },
    remarks: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Roadway' // Optional default for backward compatibility
    },
    timeline: [timelineEventSchema],
    isBulk: {
      type: Boolean,
      default: false
    },
    pages: {
      type: String, // e.g. "Pages 1-15" or "Page 2"
      trim: true,
      required: true
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionTask'
    }],
    acceptedTime: {
      type: Date
    },
    startedTime: {
      type: Date
    },
    completedTime: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

workAssignmentSchema.index({ project: 1, status: 1 });
workAssignmentSchema.index({ assignedTo: 1, status: 1 });
workAssignmentSchema.index({ dueDate: 1, status: 1 });

const WorkAssignment = mongoose.model('WorkAssignment', workAssignmentSchema);
module.exports = WorkAssignment;
