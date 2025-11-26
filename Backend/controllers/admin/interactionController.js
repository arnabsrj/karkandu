// controllers/admin/interactionController.js
import { 
  getInteractionAnalytics, 
  getBlogInteractionDetail 
} from '../../services/admin/interactionService.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Get interaction analytics (dashboard)
 * @route   GET /api/admin/interactions
 * @access  Private (Admin)
 */
export const getAnalytics = async (req, res) => {
  try {
    const { blogId, startDate, endDate } = req.query;

    const filters = {
      blogId: blogId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const result = await getInteractionAnalytics(filters);

    res.status(200).json({
      success: true,
      message: 'Interaction analytics fetched successfully',
      data: result.stats,
      summary: result.summary,
    });
  } catch (error) {
    logger.error('Get analytics controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
    });
  }
};

/**
 * @desc    Get detailed interactions for a blog
 * @route   GET /api/admin/interactions/:blogId
 * @access  Private (Admin)
 */
export const getBlogDetail = async (req, res) => {
  try {
    const { blogId } = req.params;

    const result = await getBlogInteractionDetail(blogId);

    res.status(200).json({
      success: true,
      message: 'Blog interaction details fetched',
      data: result.interactions,
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    logger.error('Get blog detail controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch blog interactions',
    });
  }
};
