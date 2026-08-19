'use strict';

const auditService = require('./audit.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  return successResponse(res, result.logs, 'Audit logs retrieved', 200, result.pagination);
});

module.exports = { getAuditLogs };
