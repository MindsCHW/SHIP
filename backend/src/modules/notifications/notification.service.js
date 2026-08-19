'use strict';

const Notification = require('../../models/Notification.model');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');

const send = async (userId, { title, body, type = 'INFO', link, relatedResource, relatedResourceId }) => {
  return Notification.create({ userId, title, body, type, link, relatedResource, relatedResourceId });
};

const getNotifications = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false })
  ]);

  return { notifications, unreadCount, pagination: buildPaginationMeta(total, page, limit) };
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

module.exports = { send, getNotifications, markAsRead, markAllAsRead };
