// src/pages/user/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaOm } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-card sacred-login">

          {/* Sacred Om Symbol */}
          <div className="sacred-om">
            <FaOm />
          </div>

          <div className="auth-header">
            <h1>Welcome Back, Seeker</h1>
            <p className="sacred-message">
              This sacred space is open only to chosen devotees.<br />
              If you have been granted access by the Guru, please enter your credentials below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group password-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="auth-btn sacred-btn" disabled={loading}>
              {loading ? 'Entering...' : 'Enter the Sacred Portal'}
            </button>
          </form>

          {/* English-only Footer */}
          <div className="auth-footer sacred-footer">
            <p>
              Don't have access yet?<br />
              <strong>Please write your spiritual reason on the Contact page.</strong><br />
              The Guru will review and grant you entry if your soul is ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;