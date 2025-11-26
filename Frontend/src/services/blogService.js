// frontend/src/services/blogService.js
import api from './api.js';
import { API } from '../config.js';

/**
 * Get all published blogs (frontend)
 */
export const getBlogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.blogs.getAll}?${params}`);
  return res.data; // { data: [...], pagination: {} }
};

/**
 * Get featured blogs
 */
export const getFeaturedBlogs = async () => {
  const res = await api.get(API.blogs.getFeatured);
  return res.data.data;
};

/**
 * Get blog by slug (frontend)
 * Interaction tracking is done via separate trackInteraction()
 */
export const getBlogBySlug = async (slug, userId) => {

  const res = await api.get(API.blogs.getBySlug(slug));
  return res.data.data;

  let userLiked = userId
  ? await Like.exists({ blog: blog._id, user: userId })
  : false;
  return {
  ...blog.toObject(),
  id: blog._id,
  isLiked: !!userLiked,   // ← MUST ADD THIS
  likeCount: blog.likesCount,
};


  // const res = await api.get(API.blogs.getBySlug(slug));
  // return res.data.data; // includes isLiked, likeCount, etc.
};

/**
 * Track interaction (view, click, read)
 */
export const trackInteraction = async (blogId, type, duration = 0) => {
  await api.post(API.interactions.track, { blogId, type, duration });
};

export default {
  getBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  trackInteraction,
};