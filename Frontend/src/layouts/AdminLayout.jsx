// src/layouts/AdminLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import {TAMIL} from "../utils/tamilText.js"
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="admin-loader">
        <Loader message="Opening sacred admin portal..." />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Admin Portal</h1>
          <div className="admin-user">
            <span className="user-greeting">Namaste {user.name}</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet /> {/* Renders Dashboard, ManageBlogs, etc. */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;