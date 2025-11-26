// controllers/user/commentController.js
import mongoose from "mongoose";
import { addComment, getBlogComments } from '../../services/user/commentService.js';
import logger from '../../utils/logger.js';
import Comment from '../../models/Comment.js';
import Blog from '../../models/Blog.js'; // used to fetch slug if needed
// import Notification from '../../models/Notification.js';
// import Blog from '../../models/Blog.js';
import Notification from '../../models/Notification.js';
// <- IMPORT Notification model (create this model if it doesn't exist)


/**
 * @desc    Add a comment to a blog
 * @route   POST /api/user/comments
 * @access  Private (User)
 */
export const createComment = async (req, res) => {
  try {
    const { blogId, content, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!blogId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID and content are required',
      });
    }

    if (content.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 2 characters',
      });
    }

    // If replying, load parent comment to validate and later notify owner
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId).populate('blog', 'slug title');
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
    }

    // Create comment (service handles validations)
    const comment = await addComment({
      blogId,
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    });

    // If reply: push reply id to parent (service may already do this; keep idempotent)
    if (parentCommentId) {
      try {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $addToSet: { replies: comment._id },
        });
      } catch (err) {
        // non-fatal but log
        logger.warn('Failed to push reply to parentComment replies array', err.message);
      }
    }

    // Notify parent comment owner (non-blocking, safe)
    if (parentComment && parentComment.user && parentComment.user.toString() !== userId.toString()) {
      (async () => {
        try {
          // build a safe link. prefer blog.slug if available, else fallback to blog id
          const blogSlug = parentComment.blog?.slug || parentComment.blog?._id;
         await Notification.create({
  user: parentComment.user,
  type: 'comment_reply',
  title: 'New reply to your comment',
  message: `${req.user.name} replied: "${content.substring(0, 50)}..."`,
  relatedComment: parentComment._id,
  relatedBlog: parentComment.blog,
  fromUser: req.user._id
});

        } catch (notifErr) {
          logger.warn('Failed to create reply notification:', notifErr.message);
        }
      })();
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    const statusCode =
      error.message?.includes('not found') ||
      error.message?.includes('not published')
        ? 404
        : 500;

    logger.error('Create comment error:', error.message || error);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add comment',
    });
  }
};

/**
 * @desc    Get comments for a blog
 * @route   GET /api/user/comments/:blogId
 * @access  Public (but shows user info if logged in)
 */
// export const getComments = async (req, res) => {
//   try {
//     const { blogId } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const result = await getBlogComments(blogId, page, limit);

//     // Ensure user field exists for each comment (avoid undefined in frontend)
//     const safeComments = result.comments.map(c => ({
//       ...c._doc,
//       user: c.user || { name: "Deleted User", avatar: null }
//     }));

//     res.status(200).json({
//       success: true,
//       message: 'Comments fetched successfully',
//       data: safeComments,
//       pagination: result.pagination,
//     });
//   } catch (error) {
//     logger.error('Get comments error:', error.message || error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to fetch comments',
//     });
//   }
// };

export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getBlogComments(blogId, page, limit);

    const currentUserId = req.user?._id?.toString() || null;

    const safeComments = result.comments.map(c => ({
      ...c._doc,
      // Main comment user (This was already correct)
      user: c.user || { name: "Deleted User", avatar: null },

      
      isLiked: currentUserId ? c.likes?.includes(currentUserId) : false,
      likeCount: c.likes?.length || 0,
      
      // 👇 FIX HERE: Explicitly assign 'user' for replies just like main comments
      replies: c.replies.map(r => ({
        ...r._doc,
        user: r.user || { name: "Deleted User", avatar: null }, // <--- ADD THIS LINE
        isLiked: currentUserId ? r.likes?.includes(currentUserId) : false,
        likeCount: r.likes?.length || 0,
      }))
    }));

    res.status(200).json({
      success: true,
      data: safeComments,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

  


// export const likeComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     const userId = req.user._id;

//     const comment = await Comment.findById(commentId);
//     if (!comment) {
//       return res.status(404).json({ success: false, message: "Comment not found" });
//     }

//     let liked = false;

//     // NEW: Notify comment owner if not self (non-blocking)
//     if (comment.user.toString() !== userId.toString()) {
//       (async () => {
//         try {
//           // We try to grab a blog slug for a link; fallback to blog id
//           const blogDoc = await Blog.findById(comment.blog).select('slug');
//           const blogSlug = blogDoc?.slug || comment.blog;
//          await Notification.create({
//   user: comment.user,
//   type: 'comment_like',
//   title: 'Your comment got a like',
//   message: `${req.user.name} liked your comment`,
//   relatedComment: comment._id,
//   relatedBlog: comment.blog,
//   fromUser: req.user._id
// });

//         } catch (notifErr) {
//           logger.warn('Failed to create like notification:', notifErr.message);
//         }
//       })();
//     }

//     // Toggle like
//     if (comment.likes?.some(id => id.toString() === userId.toString())) {
//       comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
//     } else {
//       comment.likes = comment.likes || [];
//       comment.likes.push(userId);
//       liked = true;
//     }

//     // if (comment && comment.author && comment.author._id.toString() !== req.user._id.toString()) {
//   await new Notification({
//     user: comment.author._id,
//     type: 'comment_like',
//     title: 'Someone liked your reflection',
//     message: `${req.user.name} liked your comment`,
//     relatedComment: commentId,
//     relatedBlog: comment.blog,
//     fromUser: req.user._id
//   }).save();
// // } 

// if (parentComment.author.toString() !== req.user._id.toString()) {
//   await new Notification({
//     user: parentComment.author,
//     type: 'comment_reply',
//     title: 'New reply to your reflection',
//     message: `${req.user.name} replied to your comment`,
//     relatedComment: newComment._id,
//     relatedBlog: newComment.blog,
//     fromUser: req.user._id
//   }).save();
// }

//     await comment.save();

//     res.json({
//       success: true,
//       data: {
//         liked,
//         likeCount: comment.likes.length,
//       }
//     });
//   } catch (error) {
//     logger.error('Like comment error:', error.message || error);
//     res.status(500).json({ success: false, message: "Failed to like comment" });
//   }
// };



export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    return res.json({
      success: true,
      data: {
        liked: !alreadyLiked,
        likeCount: comment.likes.length,
      }
    });

  } catch (err) {
    console.error("Like comment error:", err);
    res.status(500).json({ success: false, message: "Failed to like comment" });
  }
};






export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Reply must be at least 2 characters",
      });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    // Create reply
    const reply = await Comment.create({
      blog: parentComment.blog,
      user: userId,
      content: content.trim(),
      parentComment: parentComment._id,
    });

    // Push reply to parent
    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Non-blocking notification to parent owner
    if (parentComment.user.toString() !== userId.toString()) {
      (async () => {
        try {
          const blogDoc = await Blog.findById(parentComment.blog).select('slug');
          const blogSlug = blogDoc?.slug || parentComment.blog;
          await Notification.create({
            user: parentComment.user,
            type: 'reply',
            content: `${req.user.name || 'Someone'} replied to your comment: "${content.substring(0, 50)}..."`,
            link: `/blogs/${blogSlug}#comment-${parentComment._id}`,
          });
        } catch (notifErr) {
          logger.warn('Failed to create reply notification:', notifErr.message);
        }
      })();
    }

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: reply,
    });
  } catch (error) {
    logger.error('Reply to comment error:', error.message || error);
    res.status(500).json({
      success: false,
      message: "Failed to reply to comment",
    });
  }
};



/**
 * @desc    Delete a comment (User can delete their own comment, Admin can delete any)
 * @route   DELETE /api/user/comments/:commentId
 * @access  Private
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.user.toString() === userId.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();

    // Optionally remove from parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    // Remove child replies (soft delete them too)
    await Comment.updateMany(
      { parentComment: comment._id },
      { $set: { isDeleted: true, content: "[deleted]" } }
    );

    return res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};



export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Comment ID" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
    });

  } catch (err) {
    console.error("Toggle comment like error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
