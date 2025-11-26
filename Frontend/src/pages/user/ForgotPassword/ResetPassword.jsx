// src/pages/user/Auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ResetPassword.css'; // New dedicated file

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/user/reset-password/${token}`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sacred-auth-page">
      <div className="sacred-auth-container">
        
        {/* Back to Login */}
        <Link to="/login" className="back-to-login">
          <FaArrowLeft /> Back to Login
        </Link>

        <div className="sacred-auth-card">
          <div className="auth-header">
            <div className="auth-icon-circle">
              <FaLock size={32} />
            </div>
            <h1>Create New Password</h1>
            <p className="auth-subtitle">
              Your new password must be different from previous ones
            </p>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="sacred-auth-form">
            <div className="sacred-input-group">
              <FaLock className="sacred-input-icon" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            <div className="sacred-input-group">
              <FaLock className="sacred-input-icon" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="sacred-auth-btn" disabled={loading}>
              {loading ? 'Setting New Password...' : 'Set New Password'}
            </button>
          </form>

          <div className="auth-footer-text">
            Remembered your password? <Link to="/login">Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;