import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import Home from '../pages/user/Home-page/Home';
import Blogs from '../pages/user/Blogs/Blogs';
import BlogDetails from '../pages/user/BlogDetails/BlogDetails.jsx';
// import Pages from '../pages/user/Pages';
import Profile from '../pages/user/Profile/Profile.jsx';
import NotFound from '../pages/user/NotFound';
import Login from '../pages/user/Login';
import Register from '../pages/user/Register';
import ProtectedRoute from './ProtectedRoute';
import About from '../pages/user/Home-page/About.jsx';
import Contact from '../pages/user/Contact/Contact.jsx';
import Notifications from '../pages/user/Notifications/Notifications.jsx';
import ForgotPassword from '../pages/user/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from '../pages/user/ForgotPassword/ResetPassword.jsx';
// import ResetPassword from '../pages/user/ForgotPassword/ResetPassword.jsx';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public pages (with layout) */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />


        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth pages – No Layout */}
      <Route path="/login" element={<Login />} />
     <Route path="/register" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default UserRoutes;
