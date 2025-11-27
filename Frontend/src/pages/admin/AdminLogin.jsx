// src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader.jsx';
import { adminLogin } from '../../services/adminService.js'; // [FIX] Import directly
import './AdminLogin.css';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use context login for admin
      const response = await login(form, true); // true for isAdminLogin
      console.log("LOGIN RESPONSE:", response); // For debugging

      // No need to manually save token—context does it
      navigate('/admin/dashboard'); // Use navigate instead of window.location for no full reload (faster)
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const msg = err.response?.data?.message || 'Admin login failed';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Entering sacred admin realm..." />;

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-login">
            Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;