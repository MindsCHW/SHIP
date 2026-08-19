'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'RATING', 'IMPORT', 'SYSTEM'],
      default: 'INFO'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      trim: true
    },
    relatedResource: {
      type: String
    },
    relatedResourceId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
