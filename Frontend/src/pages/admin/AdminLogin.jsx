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
      await login(form, true); // true = admin login
      navigate('/admin');
    } catch (err) {
      alert('Admin login failed');
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