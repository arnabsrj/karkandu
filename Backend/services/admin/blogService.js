// services/admin/blogService.js
import { Blog, User } from '../../models/index.js';
import logger from '../../utils/logger.js';
import sanitizeHtml from 'sanitize-html'; // you may need to npm i sanitize-html

/**
 * Create a new blog (draft or published)
 * @param {Object} data - Blog data
 * @param {String} adminId - Admin ID
 * @returns {Object} - Created blog
 */
// export const createBlog = async (data, adminId) => {
//     console.log("Incoming blog data:", data);

//   try {
//     const { title, content, excerpt, featuredImage, tags, isPublished } = data;

//     if (!title || !content) {
//       throw new Error('Title and content are required');
//     }

//     const blog = await Blog.create({
//       title,
//       content,
//       excerpt: excerpt || content.substring(0, 300) + '...',
//       featuredImage: featuredImage || '',
//       tags: tags || [],
//       author: adminId,
//       isPublished: isPublished || false,
//       publishedAt: isPublished ? new Date() : null,
//     });

//     logger.info(`Blog created by admin ${adminId}: ${blog.title}`);

//     return blog;
//   } catch (error) {
//     logger.error('Create blog error:', error.message);
//     throw error;
//   }
// };


// services/admin/blogService.js (replace createBlog function)
// ... other imports (Blog, User, logger)

export const createBlog = async (data, adminId) => {
  try {
    console.log("Incoming blog data:", data);

    // Defensive: ensure data is an object
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid blog data');
    }

    // Pull fields
    const { 
      title, 
      content = '', 
      excerpt = '', 
      featuredImage = '', 
      tags = [], 
      category, 
      subcategory = null, 
      isPublished = false 
    } = data;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }
    if (!category) {
      throw new Error('Category is required');
    }

    // Sanitize HTML content: remove script/style tags and dangerous attributes
    const safeContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'blockquote' ]),
      allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src', 'alt', 'title', 'width', 'height' ],
        '*': [ 'class', 'style' ] // if you want to allow some styling classes
      },
      allowedSchemes: [ 'http', 'https', 'data', 'mailto' ]
    });

    // If content appears to include code (very long lines with 'function' / 'export' / 'const'), reject early
    const lower = safeContent.toLowerCase();
    const looksLikeCode = /(export\s+const|function\s+\w+|\bconsole\.log\b|=>\s*\{)/.test(lower);
    if (looksLikeCode && safeContent.length > 2000) {
      // suspicious payload: log and reject
      logger.warn(`Blog content looks suspicious for admin ${adminId} — rejecting.`);
      throw new Error('Content looks invalid. Please paste only the article body (not code).');
    }

    // Create a plain text excerpt if none provided (strip HTML)
    const plain = safeContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    // ensure excerpt length <= 300 chars (reserve 3 chars for ellipsis if we truncate)
    let finalExcerpt = excerpt && typeof excerpt === 'string' ? excerpt.trim() : '';
    if (!finalExcerpt) {
      finalExcerpt = plain.length > 297 ? plain.substring(0, 297).trim() + '...' : plain;
    } else {
      // If provided excerpt exceeds 300, trim it
      finalExcerpt = finalExcerpt.length > 300 ? finalExcerpt.substring(0, 297).trim() + '...' : finalExcerpt;
    }

    

    const blog = await Blog.create({
      title: title.trim(),
      content: safeContent,
      excerpt: finalExcerpt,
      featuredImage: featuredImage || '',
      category,
      subcategory: subcategory || null,
      tags: Array.isArray(tags) ? tags : [],
      author: adminId,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    logger.info(`Blog created by admin ${adminId}: ${blog.title}`);
    return blog;

  } catch (error) {
    logger.error('Create blog error:', error.message || error);
    throw error;
  }
};




/**
 * Update a blog
 * @param {String} blogId
 * @param {Object} data
 * @param {String} adminId
 * @returns {Object} - Updated blog
 */
export const updateBlog = async (blogId, data, adminId) => {
  try {
    const blog = await Blog.findOne({ _id: blogId, author: adminId });
    if (!blog) {
      throw new Error('Blog not found or unauthorized');
    }

    const updates = { ...data };

    // Handle publish toggle
    if (updates.isPublished && !blog.isPublished) {
      updates.publishedAt = new Date();
    } else if (!updates.isPublished && blog.isPublished) {
      updates.publishedAt = null;
    }

    Object.assign(blog, updates);
    await blog.save();

    logger.info(`Blog updated by admin ${adminId}: ${blog.title}`);

    return blog;
  } catch (error) {
    logger.error('Update blog error:', error.message);
    throw error;
  }
};

/**
 * Delete a blog (soft delete)
 * @param {String} blogId
 * @param {String} adminId
 */
export const deleteBlog = async (blogId, adminId) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: blogId,
      author: adminId
    });

    if (!blog) {
      throw new Error('Blog not found or unauthorized');
    }

    // Clear liked/commented references
    await User.updateMany(
      { $or: [{ likedBlogs: blogId }, { commentedBlogs: blogId }] },
      { $pull: { likedBlogs: blogId, commentedBlogs: blogId } }
    );

    logger.info(`Blog permanently deleted by admin ${adminId}: ${blog.title}`);

    return { message: 'Blog permanently deleted' };
  } catch (error) {
    logger.error('Delete blog error:', error.message);
    throw error;
  }
};


/**
 * Get all blogs for admin (with filters)
 * @param {Object} filters - { search, isPublished, page, limit }
 * @returns {Object} - { blogs, pagination }
 */
export const getAdminBlogs = async (filters = {}) => {
  try {
    const { search, isPublished, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = { isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email'),
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
    logger.error('Get admin blogs error:', error.message);
    throw error;
  }
};