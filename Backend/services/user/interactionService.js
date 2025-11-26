// services/user/interactionService.js
import { Interaction } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Track user interaction (click or read)
 * @param {String} blogId
 * @param {String} userId - Optional (guest allowed)
 * @param {String} type - 'click' | 'read' | 'view'
 * @param {Number} duration - Only for 'read' (seconds)
 * @returns {Object} - Success message
 */
export const trackInteraction = async (blogId, userId, type, duration = 0) => {
  try {
    // Ensure valid types
    const allowedTypes = ["view", "like", "comment", "click", "read"];
    if (!allowedTypes.includes(type)) {
      throw new Error('Invalid interaction type');
    }

    // 1. Create the Interaction
    // Your Interaction.js model has a middleware that detects this save
    // and AUTOMATICALLY updates the viewsCount in the Blog model.
    await Interaction.create({
      blog: blogId,
      user: userId || null,
      type,
      duration: type === 'read' ? Math.max(0, Math.round(duration)) : 0,
    });

    logger.info(`Interaction tracked: ${type} on blog ${blogId} by user ${userId || 'guest'}`);

    return { message: 'Interaction tracked' };
  } catch (error) {
    logger.error('Track interaction error:', error.message);
    throw error;
  }
};