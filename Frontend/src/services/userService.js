// src/services/userService.js
import api from './api.js';
import { API } from '../config.js';

/**
 * Get current user profile
 * @returns {Promise<Object>} User data
 */
export const getMe = async () => {
  const res = await api.get(API.auth.getMe);
  return res.data.data;
};
export const getProfile = async () => {
  const res = await api.get(API.auth.getProfile);
  return res.data.data;
};

/**
 * Update user profile
 * @param {Object} updates - { name, avatar }
 * @returns {Promise<Object>}
 */
export const updateProfile = async (updates) => {
  const res = await api.put(API.auth.getProfile, updates);
  return res.data.data;
};

/**
 * Get user's liked blogs
 * @param {Object} filters - { page, limit }
 * @returns {Promise<Object>}
 */
export const getLikedBlogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.auth.getProfile}/likes?${params}`);
  return res.data;
};

/**
 * Get user's commented blogs
 * @param {Object} filters - { page, limit }
 * @returns {Promise<Object>}
 */
export const getCommentedBlogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await api.get(`${API.auth.getProfile}/comments?${params}`);
  return res.data;
};

export const deleteComment = async (commentId) => {
  return api.delete(`/user/comments/${commentId}`);
};


export default {
  getProfile,
  getMe,
  updateProfile,
  getLikedBlogs,
  getCommentedBlogs,
};