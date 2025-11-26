// controllers/user/blogController.js
import { 
  getPublishedBlogs, 
  getBlogBySlug, 
  getFeaturedBlogs 
} from '../../services/user/blogService.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Get all published blogs (public)
 * @route   GET /api/user/blogs
 * @access  Public
 */
export const getBlogs = async (req, res) => {
  try {
    const { search, tag, category, subcategory, page = 1, limit = 10 } = req.query;

    const filters = {
      search: search || '',
      tag: tag || undefined,
      category: category,
      subcategory: subcategory,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await getPublishedBlogs(filters);

    res.status(200).json({
      success: true,
      message: 'Blogs fetched successfully',
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get blogs controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blogs',
    });
  }
};

/**
 * @desc    Get single blog by slug
 * @route   GET /api/user/blogs/:slug
 * @access  Public (tracks view)
 */
export const getBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id || null;

    const blog = await getBlogBySlug(slug, userId, 'view');

    res.status(200).json({
      success: true,
      message: 'Blog fetched successfully',
      data: blog,
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    logger.error('Get blog controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch blog',
    });
  }
};

/**
 * @desc    Get featured blogs (homepage)
 * @route   GET /api/user/blogs/featured
 * @access  Public
 */
export const getFeatured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const blogs = await getFeaturedBlogs(limit);

    res.status(200).json({
      success: true,
      message: 'Featured blogs fetched',
      data: blogs,
    });
  } catch (error) {
    logger.error('Get featured blogs error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured blogs',
    });
  }
};