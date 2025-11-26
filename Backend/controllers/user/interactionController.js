// controllers/user/interactionController.js
import { trackInteraction } from '../../services/user/interactionService.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Track user interaction (click or read)
 * @route   POST /api/user/interactions
 * @access  Public (guest allowed)
 */
export const track = async (req, res) => {
  try {
    const { blogId, type, duration } = req.body;
    const userId = req.user?._id || null;

   if (!blogId || !type) {
  return res.status(400).json({
    success: false,
    message: 'blogId and type are required',
  });
}

// allowed interactions including views
const allowedTypes = ["view", "like", "comment", "read", "click"];

if (!allowedTypes.includes(type)) {
  return res.status(400).json({
    success: false,
    message: "Invalid interaction type",
  });
}



    if (type === 'read' && (duration === undefined || duration < 0)) {
      return res.status(400).json({
        success: false,
        message: 'duration is required for read type and must be >= 0',
      });
    }

    await trackInteraction(blogId, userId, type, duration);

    res.status(200).json({
      success: true,
      message: 'Interaction tracked successfully',
    });
  } catch (error) {
    const statusCode = 
      error.message.includes('not found') || 
      error.message.includes('Invalid') 
        ? 400 : 500;

    logger.error('Track interaction controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to track interaction',
    });
  }
};