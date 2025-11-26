// src/services/adminService.js
import api from './api.js';
import { API } from '../config.js';

/**
 * Admin Login
 */
export const adminLogin = async (credentials) => {
  const res = await api.post(API.auth.adminLogin, credentials);
  return res.data;
};

/**
 * Create Blog
 */
export const createBlog = async (blogData) => {
  const res = await api.post(API.blogs.create, blogData);
  return res.data.data;
};

/**
 * Update Blog
 */
export const updateBlog = async (id, updates) => {
  const res = await api.put(API.blogs.update(id), updates);
  return res.data.data;
};

/**
 * Delete Blog
 */
export const deleteBlog = async (id) => {
  const res = await api.delete(API.blogs.remove(id));
  return res.data;
};

/**
 * Get All Blogs (Admin Panel)
 */
export const getAdminBlogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.blogs.getAdminBlogs}?${params}`);
  return res.data;
};

/**
 * Get All Comments (Admin)
 */
export const getAdminComments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.adminComments.getAll}?${params}`);
  return res.data;
};


/**
 * Delete Comment
 */
export const deleteComment = async (id) => {
  const res = await api.delete(API.adminComments.remove(id));
  return res.data;
};


/**
 * Get Interaction Analytics
 */
export const getAnalytics = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.interactions.analytics}?${params}`);
  return res.data;
};

/**
 * Get Blog Interaction Detail
 */
export const getBlogInteractionDetail = async (blogId) => {
  const res = await api.get(API.interactions.blogDetail(blogId));
  return res.data;
};

/**
 * Get All Users
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.adminUsers.getAll}?${params}`);
  return res.data;
};

/**
 * Get Login Logs
 */
export const getLoginLogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.adminUsers.getLogs}?${params}`);
  return res.data;
};

/**
 * Toggle User Status (ban/unban)
 */
export const toggleUserStatus = async (id) => {
  const res = await api.patch(API.adminUsers.toggleStatus(id));
  return res.data;
};

export default {
  adminLogin,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminBlogs,
  getAdminComments,
  deleteComment,
  getAnalytics,
  getBlogInteractionDetail,
  getUsers,
  getLoginLogs,
  toggleUserStatus,
};