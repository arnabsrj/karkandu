// src/routes/AdminRoutes.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Admin Pages (FLAT)
import Dashboard from '../pages/admin/Dashboard.jsx';
import ManageBlogs from '../pages/admin/ManageBlogs.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import AdminLogin from '../pages/admin/AdminLogin.jsx'; // We'll create this
import AdminComments from '../pages/admin/Comments/AdminComments.jsx';
// import Analytics from '../pages/admin/Analytics/Analytics.jsx';
// import BlogAnalyticsDetail from '../pages/admin/Analytics/BlogAnalyticsDetail.jsx';
import ContactMessages from '../pages/admin/ContactMessages/ContactMessages.jsx';
import AddUser from '../pages/admin/AddUser/AddUser.jsx';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login – No Layout */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin Pages */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/blogs" element={<ManageBlogs />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/contacts" element={<ContactMessages />} />
        <Route path="/comments" element={<AdminComments />} />
        {/* <Route path="/analytics" element={<Analytics/>} /> */}
        {/* <Route path="/analytics/blog/:blogId" element={<BlogAnalyticsDetail />} /> */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;