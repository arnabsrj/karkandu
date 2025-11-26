// controllers/admin/commentController.js
import { getAdminComments, deleteComment } from '../../services/admin/commentService.js';
import logger from '../../utils/logger.js';
import Comment from '../../models/Comment.js';


/**
 * @desc    Get all comments for admin panel
 * @route   GET /api/admin/comments
 * @access  Private (Admin)
 */
// export const getAll = async (req, res) => {
//   try {
//     const { blogId, userId, search, page = 1, limit = 10 } = req.query;

//     const filters = {
//       blogId: blogId || undefined,
//       userId: userId || undefined,
//       search: search || '',
//       page: parseInt(page),
//       limit: parseInt(limit),
//     };

//     const result = await getAdminComments(filters);

//     res.status(200).json({
//       success: true,
//       message: 'Comments fetched successfully',
//       data: result.comments,
//       pagination: result.pagination,
//     });
//   } catch (error) {
//   logger.error('Get admin comments controller error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to fetch comments',
//     });
//   }
// };


export const getAll = async (req, res) => {
  try {
    // Allow admin to see ALL comments by default
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // ← CHANGE: 1000 instead of 10
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.blogId) filters.blog = req.query.blogId;
    if (req.query.userId) filters.user = req.query.userId;
    if (req.query.search) {
      filters.content = { $regex: req.query.search, $options: 'i' };
    }

    // Only get main comments (replies will be populated)
    filters.parentId = null;

    const comments = await Comment.find(filters)
      .populate('user', 'name avatar')
      .populate('blog', 'title slug')
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments(filters);

    const formatted = comments.map(c => ({
      _id: c._id,
      content: c.content,
      likeCount: c.likes?.length || 0,
      createdAt: c.createdAt,
      author: c.user?.name || 'Anonymous',
      authorAvatar: c.user?.avatar || null,
      blogTitle: c.blog?.title || 'Deleted Blog',
      blogSlug: c.blog?.slug || '',
      replies: c.replies?.map(r => ({
        _id: r._id,
        content: r.content,
        likeCount: r.likes?.length || 0,
        createdAt: r.createdAt,
        // We must manually extract the name for replies too
        author: r.user?.name || 'Anonymous', 
        authorAvatar: r.user?.avatar || null
      })) || []
    }));

    res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      data: formatted,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Get admin comments error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


/**
 * @desc    Delete a comment (soft delete)
 * @route   DELETE /api/admin/comments/:id
 * @access  Private (Admin)
 */
// controllers/admin/commentController.js
export const removeComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Delete main comment + ALL its replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentId: commentId }
      ]
    });

    res.json({ success: true, message: 'Comment and replies deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};


// Add this to controllers/admin/commentController.js

export const fixCommentData = async (req, res) => {
  try {
    // 1. Find all comments that HAVE replies
    const parents = await Comment.find({ replies: { $exists: true, $not: { $size: 0 } } });
    
    let updatedCount = 0;

    // 2. Loop through parents and update their children
    for (const parent of parents) {
      const result = await Comment.updateMany(
        { _id: { $in: parent.replies } }, // Find all children by ID
        { $set: { parentId: parent._id } } // Set their parentId
      );
      updatedCount += result.modifiedCount;
    }

    res.json({ success: true, message: `Fixed ${updatedCount} comments. Now try refreshing your admin panel.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};