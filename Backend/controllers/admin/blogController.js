// controllers/admin/blogController.js
import { 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getAdminBlogs 
} from '../../services/admin/blogService.js';
import logger from '../../utils/logger.js';
import Blog from '../../models/Blog.js';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js'; // Ensure User is imported for notifications
// ... existing imports ...
import Subscriber from '../../models/Subscriber.js'; // Import Subscriber Model
import { sendNewsletter } from '../../utils/emailService.js'; // Import Email Service

// --- NEW IMPORTS FOR TRANSLATION ---
import { translate } from '@vitalets/google-translate-api';
import slugify from 'slugify';

// --- HELPER: Translation Function ---
const translateText = async (text) => {
  if (!text) return ''; // Handle empty strings
  if (typeof text !== 'string') return text;
  try {
    const res = await translate(text, { to: 'ta' });
    return res.text;
  } catch (err) {
    console.error("Translation Error:", err.message);
    return text; // If translation fails, keep original English
  }
};

/**
 * @desc    Create a new blog (Auto-Translates English -> Tamil)
 * @route   POST /api/admin/blogs
 * @access  Private (Admin)
 */
export const create = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { title, content, excerpt, category, subcategory, tags, isPublished, ...otherData } = req.body;

    // 1. Generate Clean English URL (Slug) BEFORE translation
    // Example: "My Life Story" -> "my-life-story"
    const englishSlug = slugify(title, { lower: true, strict: true });

    // 2. Translate Fields to Tamil
    const tamilTitle = await translateText(title);
    const tamilContent = await translateText(content);
    const tamilExcerpt = await translateText(excerpt);
    const tamilCategory = await translateText(category);
    const tamilSubcategory = await translateText(subcategory);

    // 3. Translate Tags Array
    let tamilTags = [];
    if (tags && Array.isArray(tags)) {
      tamilTags = await Promise.all(tags.map(tag => translateText(tag)));
    }

    // 4. Prepare Data for Service
    const translatedData = {
      ...otherData,
      title: tamilTitle,       // Tamil
      content: tamilContent,   // Tamil
      excerpt: tamilExcerpt,   // Tamil
      category: tamilCategory, // Tamil
      subcategory: tamilSubcategory,
      tags: tamilTags,
      slug: englishSlug,       // English (for URL)
      isPublished: isPublished,
    };

    // 5. Save to DB
    const blog = await createBlog(translatedData, adminId);


    // --- 📧 NEW: SEND EMAIL IF PUBLISHED IMMEDIATELY ---
    if (isPublished) {
      try {
        const subscribers = await Subscriber.find({});
        if (subscribers.length > 0) {
          // Send email in background (don't await strictly if you want faster response)
          sendNewsletter(subscribers, blog.title, blog.slug);
        }
      } catch (err) {
        console.error("Failed to send newsletter:", err);
      }
    }

    
    res.status(201).json({
      success: true,
      message: 'Blog created and translated successfully',
      data: blog,
    });
  } catch (error) {
    const statusCode = error.message.includes('required') ? 400 : 500;
    logger.error('Create blog controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create blog',
    });
  }
};

/**
 * @desc    Update a blog (Auto-Translates updates)
 * @route   PUT /api/admin/blogs/:id
 * @access  Private (Admin)
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { title, content, excerpt, category, subcategory, tags, ...otherUpdates } = req.body;

    // Prepare object for translated updates
    const translatedUpdates = { ...otherUpdates };

    // Only translate fields if they are present in the update request
    if (title) translatedUpdates.title = await translateText(title);
    if (content) translatedUpdates.content = await translateText(content);
    if (excerpt) translatedUpdates.excerpt = await translateText(excerpt);
    if (category) translatedUpdates.category = await translateText(category);
    if (subcategory) translatedUpdates.subcategory = await translateText(subcategory);
    
    if (tags && Array.isArray(tags)) {
      translatedUpdates.tags = await Promise.all(tags.map(tag => translateText(tag)));
    }

    // Call service with translated data
    const blog = await updateBlog(id, translatedUpdates, adminId);

    res.status(200).json({
      success: true,
      message: 'Blog updated and translated successfully',
      data: blog,
    });
  } catch (error) {
    const statusCode = 
      error.message.includes('not found') || 
      error.message.includes('unauthorized') 
        ? 404 : 500;

    logger.error('Update blog controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update blog',
    });
  }
};

/**
 * @desc    Delete a blog (soft)
 * @route   DELETE /api/admin/blogs/:id
 * @access  Private (Admin)
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const result = await deleteBlog(id, adminId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = 
      error.message.includes('not found') || 
      error.message.includes('unauthorized') 
        ? 404 : 500;

    logger.error('Delete blog controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete blog',
    });
  }
};

/**
 * @desc    Get all blogs (admin panel)
 * @route   GET /api/admin/blogs
 * @access  Private (Admin)
 */
export const getAll = async (req, res) => {
  try {
    const { search, isPublished, page = 1, limit = 10 } = req.query;

    const filters = {
      search: search || '',
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await getAdminBlogs(filters);

    res.status(200).json({
      success: true,
      message: 'Blogs fetched successfully',
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get admin blogs controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blogs',
    });
  }
};

/**
 * @desc    Toggle blog publish status (Publish / Unpublish)
 * @route   PATCH /api/admin/blogs/:id/publish
 * @access  Private (Admin)
 */
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPublished (boolean) is required',
      });
    }

    const blog = await Blog.findById(id).populate('author', 'name'); // Populate author name
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    if (blog.isPublished === isPublished) {
      return res.status(200).json({
        success: true,
        message: `Blog is already ${isPublished ? 'published' : 'unpublished'}`,
        data: blog,
      });
    }

    blog.isPublished = isPublished;
    if (isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    } else if (!isPublished) {
      blog.publishedAt = null;
    }

    await blog.save();

    // --- NOTIFICATIONS IN TAMIL ---
    if (isPublished) {
      try {
        const allUsers = await User.find({}); 

        const notifications = allUsers.map(user => ({
          user: user._id,
          type: 'new_blog',
          // Tamil Title
          title: 'புதிய புனித எழுத்து வெளியிடப்பட்டது', 
          // Tamil Message: "Admin shared wisdom: [Title]"
          message: `${blog.author.name} ஞானத்தைப் பகிர்ந்துள்ளார்: "${blog.title}"`,
          relatedBlog: blog._id
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log(`Notification sent to ${allUsers.length} users`);
        }
      } catch (err) {
        console.error("Failed to send new blog notifications:", err);
      }
    

    // 2. EMAIL NEWSLETTER (NEW)
      try {
        const subscribers = await Subscriber.find({});
        if (subscribers.length > 0) {
          // Note: ensure blog.slug exists. If not, fallback to ID or handle it.
          await sendNewsletter(subscribers, blog.title, blog.slug || blog._id);
        }
      } catch (emailErr) {
        console.error("Failed to send newsletter:", emailErr);
      }
    }

    res.status(200).json({
      success: true,
      message: `Blog ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update publish status',
    });
  }
};