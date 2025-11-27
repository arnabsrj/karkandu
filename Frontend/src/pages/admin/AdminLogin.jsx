// src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx'; // ADD THIS IMPORT IF MISSING

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ADD THIS TO GET login FROM CONTEXT

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("STARTING LOGIN WITH CREDS:", form); // DEBUG: Confirm creds
      const response = await login(form, true); // true for admin
      console.log("LOGIN RESPONSE:", response); // DEBUG: Should show full {success, message, data: {token, admin}}
      
      // Context already saves token at res.data.data.token and sets state
      navigate('/admin/dashboard'); // Redirect (no full reload needed)
    } catch (err) {
      console.error("LOGIN ERROR:", err); // This is what you're seeing now
      const msg = err?.response?.data?.message || 'Admin login failed - check creds or network';
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