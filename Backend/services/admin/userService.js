// services/admin/userService.js
import { User, LoginLog } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get all users (admin panel) with filters
 * @param {Object} filters - { search, role, isActive, page, limit }
 * @returns {Object} - { users, pagination }
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const { search, role, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('likedBlogs', 'title slug')
        .populate('commentedBlogs', 'title slug'),
      User.countDocuments(query),
    ]);

    const userStats = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      joinedAt: user.createdAt,
      stats: {
        likedCount: user.likedBlogs.length,
        commentedCount: user.commentedBlogs.length,
      },
    }));

    return {
      users: userStats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Get all users error:', error.message);
    throw error;
  }
};

/**
 * Get login logs for a user or all users
 * @param {Object} filters - { userId, page, limit }
 * @returns {Object} - { logs, pagination }
 */
export const getLoginLogs = async (filters = {}) => {
  try {
    const { userId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.user = userId;

    const [logs, total] = await Promise.all([
      LoginLog.find(query)
        .sort({ loginAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email'),
      LoginLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Get login logs error:', error.message);
    throw error;
  }
};

/**
 * Toggle user active status (ban/unban)
 * @param {String} userId
 * @returns {Object} - Updated user
 */
export const toggleUserStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`Admin toggled user ${user.email} status to ${user.isActive ? 'active' : 'inactive'}`);

    return {
      id: user._id,
      isActive: user.isActive,
    };
  } catch (error) {
    logger.error('Toggle user status error:', error.message);
    throw error;
  }
};