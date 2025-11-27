// src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader.jsx';
import './AdminLogin.css';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form, true); // true = admin login
      localStorage.setItem('token', res.data.token);
      // --- DEBUGGING START ---
      console.log("LOGIN RESPONSE:", res); 
      // Check if the token is actually at res.data.token or just res.token
      const tokenToSave = res.data?.token || res.token || res.data?.data?.token; 
      console.log("SAVING TOKEN:", tokenToSave);
      // --- DEBUGGING END ---
      navigate('/admin');
    } catch (err) {
        alert(err.response?.data?.message || 'Admin login failed');
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