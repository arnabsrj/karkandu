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
      // [FIX] Call the service directly. This GUARANTEES we get the data.
      // adminService.js returns 'res.data', so 'response' here IS the data object.
      const response = await adminLogin(form); 

      console.log("DIRECT API RESPONSE:", response); 

      // Extract token (handle both structures just in case)
      const token = response.token || response.data?.token;

      if (token) {
        console.log("SAVING TOKEN:", token);
        // 1. Save Token
        localStorage.setItem('token', token);
        
        // 2. Hard Redirect to force the App to reload and pick up the token
        window.location.href = '/admin/dashboard';
      } else {
        alert("Login successful, but Server sent no token!");
      }

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