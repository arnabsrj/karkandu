// services/user/profileService.js
import { User } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get detailed user profile with liked & commented blogs
 * @param {String} userId - User ID from JWT
 * @returns {Object} - Profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'likedBlogs',
        select: 'title slug excerpt featuredImage createdAt',
        match: { isPublished: true },
      })
      .populate({
        path: 'commentedBlogs',
        select: 'title slug excerpt featuredImage createdAt',
        match: { isPublished: true },
      });

    if (!user) {
      throw new Error('User not found');
    }

    // Filter out unpublished/deleted blogs
    const likedBlogs = user.likedBlogs || [];
    const commentedBlogs = user.commentedBlogs || [];

    logger.info(`Profile fetched for user: ${user.email}`);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      stats: {
        likedCount: likedBlogs.length,
        commentedCount: commentedBlogs.length,
      },
      likedBlogs,
      commentedBlogs,
      joinedAt: user.createdAt,
    };
  } catch (error) {
    logger.error('Get profile error:', error.message);
    throw error;
  }
};