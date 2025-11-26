// services/admin/commentService.js
import { Comment, Blog, User } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get all comments (admin panel) with filters
 * @param {Object} filters - { blogId, userId, search, page, limit }
 * @returns {Object} - { comments, pagination }
 */
export const getAdminComments = async (filters = {}) => {
  try {
    const { blogId, userId, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };

    if (blogId) query.blog = blogId;
    if (userId) query.user = userId;
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('blog', 'title slug')
        .populate('user', 'name email avatar')
        .populate({
          path: 'replies',
          match: { isDeleted: false },
          populate: { path: 'user', select: 'name avatar' },
        }),
      Comment.countDocuments(query),
    ]);

    return {
  comments: comments.map(c => ({
    _id: c._id,
    author: c.user?.name || "Unknown User",
    authorAvatar: c.user?.avatar || null,
    content: c.content,
    blogTitle: c.blog?.title || "Unknown Blog",
    blogSlug: c.blog?.slug || "#",
    likeCount: c.likes?.length || 0,
    createdAt: c.createdAt,
  })),
  pagination: {
    total,
    page,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  }
};
;
  } catch (error) {
    logger.error('Get admin comments error:', error.message);
    throw error;
  }
};

/**
 * Delete a comment (soft delete)
 * @param {String} commentId 
 * @returns {Object} - Success message
 */
export const deleteComment = async (commentId) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true },
      { new: true }
    ).populate('blog', 'title');

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Remove from user's commentedBlogs if needed
    await User.updateMany(
      { commentedBlogs: comment.blog },
      { $pull: { commentedBlogs: comment.blog } }
    );

    logger.info(`Admin deleted comment ${commentId} on blog "${comment.blog?.title}"`);

    return { message: 'Comment deleted successfully' };
  } catch (error) {
    logger.error('Delete comment error:', error.message);
    throw error;
  }
};