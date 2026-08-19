'use strict';

const AuditLog = require('../../models/AuditLog.model');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');

const log = async ({ userId, userName, userRole, action, resource, resourceId, previousValue, newValue, ip, userAgent, description }) => {
  try {
    return await AuditLog.create({
      userId, userName, userRole, action, resource,
      resourceId, previousValue, newValue, ip, userAgent, description
    });
  } catch (err) {
    // Never throw from audit log — it's a non-critical side-effect
    console.error('AuditLog error:', err.message);
  }
};

const getAuditLogs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.userId) filter.userId = query.userId;
  if (query.resource) filter.resource = query.resource;
  if (query.action) filter.action = query.action;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter)
  ]);

  return { logs, pagination: buildPaginationMeta(total, page, limit) };
};

module.exports = { log, getAuditLogs };
