'use strict';

const notificationService = require('./notification.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user._id, req.query);
  return successResponse(
    res,
    { notifications: result.notifications, unreadCount: result.unreadCount },
    'Notifications retrieved',
    200,
    result.pagination
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return successResponse(res, notification, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return successResponse(res, null, 'All notifications marked as read');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
