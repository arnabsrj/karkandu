// src/pages/user/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import { FaEnvelope, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/user/forgot-password', { email });
      setMessage(res.data.message || 'Check your email for the magic reset link!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Sending ancient reset scroll..." />;

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset Your Password</h1>
            <p>Don’t worry, seeker. We’ll help you find your way back.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert error-msg">
                <FaExclamationCircle /> {error}
              </div>
            )}
            {message && (
              <div className="alert success-msg">
                <FaCheckCircle /> {message}
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/login">← Back to Login</Link>
            </p>
            <p className="small-text">
              Check spam folder if you don’t see the email in 1-2 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;