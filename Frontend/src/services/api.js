// src/services/api.js
import axios from 'axios';
import API from '../config.js'; // ← Import API object

// Extract base URL from your config pattern
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // --- DEBUGGING START ---
    console.log("INTERCEPTOR RUNNING");
    console.log("Token in LocalStorage:", token);
    // --- DEBUGGING END ---
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Instead of redirecting immediately, just clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Let React handle redirect logic
    }
    return Promise.reject(error);
  }
);


export default api;