// services/user/likeService.js
import { Like, Blog, User } from '../../models/index.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';  
/**
 * Toggle like on a blog
 * @param {String} blogId - Blog ID
 * @param {String} userId - User ID from JWT
 * @returns {Object} - { liked: true/false, likeCount: number }
 */
// export const toggleLike = async (blogId, userId) => {



//   try {

//       if (!mongoose.Types.ObjectId.isValid(blogId)) {
//       throw new Error('Invalid blog ID');
//     }
//     // Validate blog exists and is published
//     const blog = await Blog.findOne({ _id: blogId, isPublished: true });
//     if (!blog) {
//       throw new Error('Blog not found or not published');
//     }

//     const existingLike = await Like.findOne({ blog: blogId, user: userId });

//     if (existingLike) {
//       // Unlike
//       await existingLike.deleteOne();

//       // Update user's likedBlogs
//       await User.findByIdAndUpdate(
//         userId,
//         { $pull: { likedBlogs: blogId } },
//         { new: true }
//       );

//       logger.info(`User ${userId} unliked blog ${blogId}`);

//       return {
//         liked: false,
//         message: 'Blog unliked',
//         likeCount: blog.likesCount - 1 || 0,
//       };
//     } else {
//       // Like
//       const like = await Like.create({
//         blog: blogId,
//         user: userId,
//       });

//       // Update user's likedBlogs
//       await User.findByIdAndUpdate(
//         userId,
//         { $addToSet: { likedBlogs: blogId } },
//         { new: true }
//       );

//       logger.info(`User ${userId} liked blog ${blogId}`);

//       return {
//         liked: true,
//         message: 'Blog liked',
//         likeCount: blog.likesCount + 1 || 1,
//         likeId: like._id,
//       };
//     }
//   } catch (error) {
//     logger.error('Toggle like error:', error.message);
//     throw error;
//   }
// };

  

  export const toggleLike = async (blogId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new Error('Invalid blog ID');
    }

    const blog = await Blog.findOne({ _id: blogId, isPublished: true });
    if (!blog) {
      throw new Error('Blog not found or not published');
    }

    const existingLike = await Like.findOne({ blog: blogId, user: userId });

    if (existingLike) {
      // UNLIKE
      await existingLike.deleteOne();

      await User.findByIdAndUpdate(userId, {
        $pull: { likedBlogs: blogId }
      });

      // ❗ FIX: update likeCount in DB
      await Blog.findByIdAndUpdate(blogId, {
        $inc: { likesCount: -1 }
      });

      logger.info(`User ${userId} unliked blog ${blogId}`);

      return {
        liked: false,
        message: 'Blog unliked',
        likeCount: blog.likesCount - 1,
      };
    } else {
      // LIKE
      const like = await Like.create({ blog: blogId, user: userId });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { likedBlogs: blogId }
      });

      // ❗ FIX: update likeCount in DB
      await Blog.findByIdAndUpdate(blogId, {
        $inc: { likesCount: 1 }
      });

      logger.info(`User ${userId} liked blog ${blogId}`);

      return {
        liked: true,
        message: 'Blog liked',
        likeCount: blog.likesCount + 1,
        likeId: like._id,
      };
    }
  } catch (error) {
    logger.error('Toggle like error:', error.message);
    throw error;
  }
};


/**
 * Get like status and count for a blog
 * @param {String} blogId
 * @param {String} userId - Optional (for logged-in user)
 * @returns {Object} - { isLiked, likeCount }
 */
export const getLikeStatus = async (blogId, userId = null) => {
  try {
   const [likeCount, userLike] = await Promise.all([
  Blog.findById(blogId).select('likesCount'), // ← Use Blog field
  userId ? Like.findOne({ blog: blogId, user: userId }) : null,
]);

return {
  isLiked: !!userLike,
  likeCount: likeCount?.likesCount || 0,
};
  } catch (error) {
    logger.error('Get like status error:', error.message);
    throw error;
  }
};