// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // AUTO LOGIN CHECK
  const getMe = async () => {
    try {
      // First try USER
      const userRes = await api.get('/user/profile');
      const userData = userRes.data.data;

      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(false);
    } catch (userErr) {
      // If USER fails, try ADMIN
      try {
        const adminRes = await api.get('/admin/profile');
        const adminData = adminRes.data.data;

        setUser(adminData);
        setIsAuthenticated(true);
        setIsAdmin(true);
      } catch (adminErr) {
        // Neither user nor admin logged in
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  // LOGIN
  const login = async (credentials, isAdminLogin = false) => {
    const endpoint = isAdminLogin ? '/admin/login' : '/user/login';
    const res = await api.post(endpoint, credentials);

     // 2️⃣ Save token to localStorage
  if (res.data && res.data.data?.token) {
    localStorage.setItem('token', res.data.data.token);
  } else {
    throw new Error('Token missing from login response');
  }

    // Fetch role-specific profile
    const profileRes = await api.get(isAdminLogin ? '/admin/profile' : '/user/profile');
    const userData = profileRes.data.data;

    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(isAdminLogin); 

    return res.data;
  };

  // REGISTER (user only)
  const register = async (userData) => {
    const res = await api.post('/user/register', userData);
    await getMe();
    return res.data;
  };

  // LOGOUT (clears cookie)
  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  // ✅ NEW: Update Profile Function
  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/user/profile', formData);
      
      // Update local state immediately so UI reflects changes
      setUser((prev) => ({
        ...prev,
        name: res.data.data.name,
        bio: res.data.data.bio,
      }));
      
      return res.data;
    } catch (err) {
      console.error("Update Profile Failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        getMe,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
