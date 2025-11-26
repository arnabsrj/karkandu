// controllers/user/likeController.js
import mongoose from 'mongoose';
import { toggleLike, getLikeStatus } from '../../services/user/likeService.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Toggle like on a blog
 * @route   POST /api/user/likes/:blogId
 * @access  Private (User)
 */
export const toggleBlogLike = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user?._id;

    console.log("🟢 Hit toggleBlogLike route");
    console.log("➡️ blogId:", blogId);
    console.log("➡️ userId:", userId);

    // ✅ Validate ObjectId format before any DB call
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format',
      });
    }

    const result = await toggleLike(blogId, userId);

    console.log("✅ Like operation successful:", result);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        blogId,
        liked: result.liked,
        likeCount: result.likeCount,
      },
    });
  } catch (error) {
    const statusCode =
      error.message.includes('not found') ||
      error.message.includes('not published')
        ? 404
        : 500;

    logger.error('Toggle like controller error:', error.message);
    console.error("❌ toggleBlogLike error:", error);

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to toggle like',
    });
  }
};

/**
 * @desc    Get like status for a blog
 * @route   GET /api/user/likes/:blogId/status
 * @access  Public (but shows user-specific like if logged in)
 */
export const getBlogLikeStatus = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user?._id || null;

    console.log("🟢 Hit getBlogLikeStatus route");
    console.log("➡️ blogId:", blogId);

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format',
      });
    }

    const { isLiked, likeCount } = await getLikeStatus(blogId, userId);

    return res.status(200).json({
      success: true,
      data: {
        blogId,
        isLiked,
        likeCount,
      },
    });
  } catch (error) {
    logger.error('Get like status controller error:', error.message);
    console.error("❌ getBlogLikeStatus error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch like status',
    });
  }
};
