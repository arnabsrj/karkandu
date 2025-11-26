// services/user/commentService.js
// import { Comment, Blog, User } from '../../models/index.js';
import Comment from '../../models/Comment.js';
import Blog from '../../models/Blog.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

/**
 * Add a comment to a blog
 * @param {Object} data - { blogId, userId, content, parentCommentId }
 * @returns {Object} - New comment
 */
export const addComment = async ({ blogId, userId, content, parentCommentId = null }) => {
  try {
    // Validate blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, isPublished: true });
    if (!blog) {
      throw new Error('Blog not found or not published');
    }

    // Validate parent comment (if reply)
    if (parentCommentId) {
      const parent = await Comment.findOne({ _id: parentCommentId, blog: blogId });
      if (!parent) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = await Comment.create({
      blog: blogId,
      user: userId,
      content,
      parentComment: parentCommentId,
    });

    // Update user's commentedBlogs
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { commentedBlogs: blogId } },
      { new: true }
    );

    // If reply, update parent
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar')
      .populate('blog', 'title slug');

    logger.info(`Comment added by user ${userId} on blog ${blogId}`);

    return populatedComment;
  } catch (error) {
    logger.error('Add comment error:', error.message);
    throw error;
  }
};

/**
 * Get comments for a blog (with pagination & replies)
 * @param {String} blogId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Object} - { comments, total, pages }
 */
export const getBlogComments = async (blogId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ blog: blogId, parentComment: null, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar _id')
      .populate({
  path: 'replies',
  match: { isDeleted: false },
  populate: [
    { path: 'user', select: 'name avatar _id' },
      {
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    },
    { path: 'likes' }
  ],
  options: { sort: { createdAt: 1 } },
}),
      Comment.countDocuments({ blog: blogId, parentComment: null, isDeleted: false }),
    ]);

    return {
      comments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Get comments error:', error.message);
    throw error;
  }
};