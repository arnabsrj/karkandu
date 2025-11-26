// src/layouts/UserLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './UserLayout.css';
import Loader from '../components/common/Loader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

const UserLayout = () => {
  const { loading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="layout-loader">
        <Loader message="Awakening the lotus..." />
      </div>
    );
  }

  return (
    <div className="user-layout">
      <Navbar />
      <main className="layout-main">
        <Outlet /> {/* Renders child routes: Home, Blogs, etc. */}
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;