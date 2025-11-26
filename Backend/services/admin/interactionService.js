// services/admin/interactionService.js
import { Interaction, Blog } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get interaction analytics for all blogs or a specific blog
 * @param {Object} filters - { blogId, startDate, endDate }
 * @returns {Object} - Aggregated stats
 */
export const getInteractionAnalytics = async (filters = {}) => {
  try {
    const { blogId, startDate, endDate } = filters;

    const match = {};
    if (blogId) match.blog = blogId;

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: match },

      {
        $group: {
          _id: '$blog',

          // 👇 FIXED (added all missing fields)
          views: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] } },
          reads: { $sum: { $cond: [{ $eq: ['$type', 'read'] }, 1, 0] } },
          likes: { $sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] } },
          comments: { $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] } },

          totalReadTime: {
            $sum: { $cond: [{ $eq: ['$type', 'read'] }, '$duration', 0] }
          },

          uniqueUsers: { $addToSet: '$user' }
        }
      },

      {
        $addFields: {
          uniqueUserCount: {
            $size: {
              $filter: {
                input: '$uniqueUsers',
                cond: { $ne: ['$$this', null] }
              }
            }
          }
        }
      },

      { $unset: 'uniqueUsers' },

      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: '_id',
          as: 'blog'
        }
      },

      { $unwind: '$blog' },

      {
        $addFields: {
          avgReadTime: {
            $cond: [
              { $gt: ['$reads', 0] },
              {
                $round: [
                  { $divide: ['$totalReadTime', '$reads'] },
                  1
                ]
              },
              0
            ]
          },
          title: '$blog.title',
          slug: '$blog.slug'
        }
      },

      { $sort: { views: -1 } }
    ];

    const results = await Interaction.aggregate(pipeline);

    // 🔥 FIXED summary (added missing fields)
    const summary = results.reduce(
      (acc, curr) => ({
        totalViews: acc.totalViews + curr.views,
        totalClicks: acc.totalClicks + curr.clicks,
        totalReads: acc.totalReads + curr.reads,
        totalLikes: acc.totalLikes + curr.likes,
        totalComments: acc.totalComments + curr.comments,
        totalReadTime: acc.totalReadTime + curr.totalReadTime
      }),
      {
        totalViews: 0,
        totalClicks: 0,
        totalReads: 0,
        totalLikes: 0,
        totalComments: 0,
        totalReadTime: 0
      }
    );

    return {
      stats: results.map((r) => ({
        blogId: r._id,
        title: r.title,
        slug: r.slug,
        views: r.views,
        clicks: r.clicks,
        reads: r.reads,
        likes: r.likes,
        comments: r.comments,
        avgReadTime: r.avgReadTime,
        uniqueUsers: r.uniqueUserCount
      })),

      summary: {
        ...summary,
        avgReadTimeOverall:
          summary.totalReads > 0
            ? Math.round(summary.totalReadTime / summary.totalReads)
            : 0
      }
    };
  } catch (error) {
    logger.error('Get interaction analytics error:', error.message);
    throw error;
  }
};


/**
 * Get detailed interactions for a single blog
 * @param {String} blogId
 * @returns {Object} - Time-series or per-user data
 */
export const getBlogInteractionDetail = async (blogId) => {
  try {
    const data = await Interaction.aggregate([
      { $match: { blog: blogId } },

      {
        $group: {
          _id: '$blog',

          views: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] } },
          reads: { $sum: { $cond: [{ $eq: ['$type', 'read'] }, 1, 0] } },
          likes: { $sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] } },
          comments: { $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] } },

          totalReadTime: {
            $sum: { $cond: [{ $eq: ['$type', 'read'] }, '$duration', 0] }
          },

          uniqueUsers: { $addToSet: '$user' }
        }
      },

      {
        $addFields: {
          uniqueUsers: {
            $filter: {
              input: '$uniqueUsers',
              cond: { $ne: ['$$this', null] }
            }
          }
        }
      }
    ]);

    return { interactions: data[0] || {} };
  } catch (error) {
    logger.error('Get blog interaction detail error:', error.message);
    throw error;
  }
};
