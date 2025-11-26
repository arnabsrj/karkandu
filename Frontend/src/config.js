// src/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API = {
  // Auth
  auth: {
    register: `${API_BASE_URL}/user/register`,
    login: `${API_BASE_URL}/user/login`,
    getMe: `${API_BASE_URL}/user/me`,
    getProfile: `${API_BASE_URL}/user/profile`,
  },

  admin: {
    login: `${API_BASE_URL}/admin/login`,
    register: `${API_BASE_URL}/admin/register`,
  },

  // Blogs
  blogs: {
    getAll: `${API_BASE_URL}/user/blogs`,
    getFeatured: `${API_BASE_URL}/user/blogs/featured`,
    getBySlug: (slug) => `${API_BASE_URL}/user/blogs/${slug}`,
  },

  // Admin Blogs
  adminBlogs: {
    create: `${API_BASE_URL}/admin/blogs`,
    update: (id) => `${API_BASE_URL}/admin/blogs/${id}`,
    remove: (id) => `${API_BASE_URL}/admin/blogs/${id}`,
    getAll: `${API_BASE_URL}/admin/blogs`,
  },

  // Likes
  likes: {
    toggle: (blogId) => `${API_BASE_URL}/user/likes/${blogId}`,
    status: (blogId) => `${API_BASE_URL}/user/likes/${blogId}/status`,
  },

  // Comments
  // comments: {
  //   create: `${API_BASE_URL}/user/comments`,
  //   getByBlog: (blogId) => `${API_BASE_URL}/user/comments/${blogId}`,
  // },

  // Comments
comments: {
  create: `${API_BASE_URL}/user/comments`,
  getByBlog: (blogId) => `${API_BASE_URL}/user/comments/${blogId}`,
  like: (commentId) => `${API_BASE_URL}/user/comments/${commentId}/like`,
  reply: (commentId) => `${API_BASE_URL}/user/comments/${commentId}/reply`,
  delete: (id) => `${API_BASE_URL}/user/comments/${id}`,
},


  // Admin Comments
  adminComments: {
    getAll: `${API_BASE_URL}/admin/comments`,
    remove: (id) => `${API_BASE_URL}/admin/comments/${id}`,
  },

  // Admin Contacts ← ADD THIS BLOCK
  adminContacts: {
    getAll: `${API_BASE_URL}/admin/contacts`,
  },

  // Interactions
  interactions: {
    track: `${API_BASE_URL}/user/interactions`,
  },

  // Admin Interactions
  adminInteractions: {
    getAnalytics: `${API_BASE_URL}/admin/interactions`,
    getBlogDetail: (blogId) => `${API_BASE_URL}/admin/interactions/${blogId}`,
  },

  // Admin Users
  adminUsers: {
    getAll: `${API_BASE_URL}/admin/users`,
    getLogs: `${API_BASE_URL}/admin/users/logs`,
    toggleStatus: (id) => `${API_BASE_URL}/admin/users/${id}/status`,
  },
};

export default API;