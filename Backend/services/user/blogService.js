// services/user/blogService.js
import { Blog, Like, Comment } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get published blogs (public)
 * @param {Object} filters - { search, tag, category, subcategory, page, limit }
 * @returns {Object} - { blogs, pagination }
 */
export const getPublishedBlogs = async (filters = {}) => {
  try {
    const { search, tag, category, subcategory, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Base query
    const query = { isPublished: true, isDeleted: { $ne: true } };

    // 1. Search Filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Tag Filter
    if (tag) {
      query.tags = tag;
    }

    // 3. Category Filter [FIXED]
    if (category) {
      query.category = category;
    }

    // 4. Sub-category Filter [FIXED]
    if (subcategory) {
      query.subcategory = subcategory;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('title slug excerpt featuredImage tags createdAt author viewsCount likesCount readsCount publishedAt category subcategory')
        .populate('author', 'name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    return {
      blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Get published blogs error:', error.message);
    throw error;
  }
};

/**
 * Get single blog by slug (public + interaction tracking)
 * @param {String} slug
 * @param {String} userId - Optional (for like/comment status)
 * @param {String} interactionType - 'view' | 'click' | 'read'
 * @returns {Object} - Blog with user interaction
 */
export const getBlogBySlug = async (slug, userId = null, interactionType = null) => {
  try {
    const blog = await Blog.findOne({ slug, isPublished: true, isDeleted: { $ne: true } })
      .populate('author', 'name avatar');

    if (!blog) {
      throw new Error('Blog not found');
    }

    // Track interaction if provided
    if (interactionType && ['view', 'click', 'read'].includes(interactionType)) {
      // Dynamic import to avoid circular dependency if Interaction is in index.js
      const Interaction = (await import('../../models/index.js')).Interaction;
      
      await Interaction.create({
        blog: blog._id,
        user: userId || null,
        type: interactionType,
        duration: interactionType === 'read' ? 0 : undefined,
      });
    }

    // Get like & comment status
    const [likeStatus, commentCount] = await Promise.all([
      userId ? Like.findOne({ blog: blog._id, user: userId }) : null,
      Comment.countDocuments({ blog: blog._id, isDeleted: false }),
    ]);

    return {
      ...blog.toObject(),
      isLiked: !!likeStatus,
      likeCount: blog.likesCount || 0,
      commentCount,
    };
  } catch (error) {
    logger.error('Get blog by slug error:', error.message);
    throw error;
  }
};

/**
 * Get featured blogs (for homepage)
 * @param {Number} limit
 * @returns {Array} - Top blogs by views/reads
 */
export const getFeaturedBlogs = async (limit = 3) => {
  try {
    const blogs = await Blog.find({ isPublished: true, isDeleted: { $ne: true } })
      .select('title slug excerpt featuredImage')
      .sort({ viewsCount: -1, readsCount: -1 })
      .limit(limit);

    return blogs;
  } catch (error) {
    logger.error('Get featured blogs error:', error.message);
    throw error;
  }
};