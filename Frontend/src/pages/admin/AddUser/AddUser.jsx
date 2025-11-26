// src/pages/admin/AddUser/AddUser.jsx
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import './AddUser.css';

const AddUser = () => {
  const [form, setForm] = useState({ name: '', email: '', password: 'tamilsage108' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // success or error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post('/admin/users/create', form);
      setResult({
        type: 'success',
        data: res.data.data
      });
      setForm({ name: '', email: '', password: 'tamilsage108' });
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create user'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <div className="add-user-wrapper">
        <div className="add-user-header">
          <h1>Create New Devotee Account</h1>
          <p>Grant access to a worthy soul seeking wisdom</p>
        </div>

        <div className="add-user-content">
          {/* Result Message */}
          {result && (
            <div className={`result-alert ${result.type}`}>
              {result.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              <div>
                {result.type === 'success' ? (
                  <>
                    <h4>Account Created Successfully</h4>
                    <div className="credentials-grid">
                      <div><strong>Name:</strong> {result.data.name}</div>
                      <div><strong>Email:</strong> {result.data.email}</div>
                      <div><strong>Password:</strong> <span className="password">{result.data.temporaryPassword || form.password}</span></div>
                    </div>
                    <p className="note">Please share these credentials securely via email or WhatsApp</p>
                  </>
                ) : (
                  <p>{result.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="add-user-form">
            <div className="form-row">
              <label>Full Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="devotee@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label>Password </label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank for default or Make your own"
                />
              </div>
              <p className="field-note">
                Default password: <strong>tamilsage108</strong>
              </p>
            </div>

            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? (
                <>Creating Account...</>
              ) : (
                <>Create Devotee Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;