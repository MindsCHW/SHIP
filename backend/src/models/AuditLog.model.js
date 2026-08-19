'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userName: { type: String },
    userRole: { type: String },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
        'RATE_HO', 'RATE_SPV', 'IMPORT_SURVEY', 'IMPORT_MASTER',
        'EXPORT', 'VIEW'
      ]
    },
    resource: {
      type: String,
      required: true // e.g. 'inspection', 'project', 'user'
    },
    resourceId: {
      type: String
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    },
    ip: { type: String },
    userAgent: { type: String },
    description: { type: String }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
