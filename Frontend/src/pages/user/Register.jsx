// src/pages/user/Register/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaOm } from 'react-icons/fa';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-card sacred-register">

          {/* Sacred Om Symbol */}
          <div className="sacred-om">
            <FaOm />
          </div>

          <div className="auth-header">
            <h1>Join the Sacred Journey</h1>
            <p className="sacred-message">
              This spiritual sanctuary is open only to those called by the soul.<br />
              If your heart seeks true wisdom, create your sacred account below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

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
            </div>

            <div className="input-group password-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
              {loading ? 'Creating Account...' : 'Create Sacred Account'}
            </button>
          </form>

          <div className="auth-footer sacred-footer">
            {/* <p>
              Already have access?<br />
              <Link to="/login">Return to Login</Link>
            </p> */}
            <p className="note">
              <strong>Note:</strong> Registration is open only to sincere seekers.<br />
              The Guru reviews all souls who wish to enter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;