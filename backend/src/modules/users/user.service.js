'use strict';

const User = require('../../models/User.model');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination.util');

/**
 * Gets all users with optional filtering and pagination
 */
const getAllUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.status === 'active') filter.isActive = true;
  if (query.status === 'inactive') filter.isActive = false;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { username: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * Gets a single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

/**
 * Creates a new user
 */
const createUser = async (data) => {
  const { password, ...rest } = data;
  const user = await User.create({ ...rest, passwordHash: password });
  return user;
};

/**
 * Updates a user
 */
const updateUser = async (id, data) => {
  const { password, ...rest } = data;

  const update = { ...rest };
  if (password) {
    // Will be hashed by pre-save hook - we need to use save(), not findByIdAndUpdate()
    const user = await User.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    Object.assign(user, update);
    user.passwordHash = password;
    return await user.save();
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

/**
 * Toggles user active status
 */
const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Deletes a user (soft delete via isActive = false)
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

/**
 * Gets user statistics
 */
const getUserStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);

  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });

  return { total, active, inactive: total - active, byRole: stats };
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, toggleUserStatus, deleteUser, getUserStats };
