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
      // localStorage.setItem('token', res.data.token);


      // --- DEBUGGING START ---
      console.log("LOGIN RESPONSE:", res); 
     // Correctly extract the token. 
    // Since adminService returns res.data, the token is likely just 'res.token'
    const tokenToSave = res.token || res.data?.token;
      console.log("SAVING TOKEN:", tokenToSave);
      // --- DEBUGGING END ---
        if (tokenToSave) {
        // ✅ FIX: Save the correctly extracted token
        localStorage.setItem('token', res.data.token || tokenToSave);

      navigate('/admin');
      } else {
        alert("Login successful but no token found!");
    }

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