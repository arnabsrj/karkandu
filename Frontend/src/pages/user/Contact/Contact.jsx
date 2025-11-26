// src/pages/user/Contact/Contact.jsx
import React, { useState } from 'react';
import { FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLeaf, FaKey, FaHandsHelping } from 'react-icons/fa';
import Loader from '../../../components/common/Loader.jsx';
import api from '../../../services/api.js';
import { TAMIL } from '../../../utils/tamilText.js';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.post('/user/contact', formData);
      setSuccess("உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது. விரைவில் தொடர்பு கொள்வோம்");
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || "ஏதோ தவறு நேர்ந்தது. மீண்டும் முயற்சிக்கவும்");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>{TAMIL.contactTitle || "தொடர்பு கொள்ளுங்கள்"}</h1>
          <p>{TAMIL.contactSubtitle || "உங்கள் கேள்விகள், ஆசிகள், ஞானத்தேடல் — எதுவாக இருந்தாலும் எங்களை அணுகுங்கள்"}</p>
        </div>
        <FaLeaf className="floating-leaf" />
      </section>

      {/* NEW SACRED LOGIN REQUEST SECTION */}
      <div className="login-request-section">
        <div className="login-request-card">
          <div className="login-icon">
            <FaKey />
          </div>
          <h3>உள்நுழைய அனுமதி வேண்டுமா?</h3>
          <p>
            இந்த ஆன்மீக இடம் தேர்ந்தெடுக்கப்பட்ட பக்தர்களுக்கு மட்டுமே திறக்கப்பட்டுள்ளது.<br />
            நீங்கள் உள்நுழைய விரும்பினால், கீழே உங்கள் பெயர், மின்னஞ்சல் மற்றும் <strong>ஏன் உள்நுழைய வேண்டும் என்பதை</strong> தெளிவாக எழுதி அனுப்புங்கள்.
          </p>
          <div className="blessing">
            <FaHandsHelping /> நாங்கள் உங்கள் ஆன்மீக பயணத்தை ஆசீர்வதித்து, உள்நுழைவு அனுமதி வழங்குவோம்
          </div>
        </div>
      </div>

      <div className="contact-container">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>எங்களை அணுகுங்கள்</h2>
          
          <div className="info-item">
            <FaEnvelope className="icon" />
            <div>
              <h4>மின்னஞ்சல்</h4>
              <p>hello@tamilsage.com</p>
            </div>
          </div>
          
          <div className="info-item">
            <FaPhone className="icon" />
            <div>
              <h4>தொலைபேசி</h4>
              <p>+91 98765 43210</p>
            </div>
          </div>
          
          <div className="info-item">
            <FaMapMarkerAlt className="icon" />
            <div>
              <h4>இடம்</h4>
              <p>தமிழ் ஞான மடம், இதயத்தில்...</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-card">
          <h2>உங்கள் செய்தியை அனுப்புங்கள்</h2>
          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="உங்கள் பெயர் *"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="மின்னஞ்சல் முகவரி *"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="கைபேசி எண் (விரும்பினால்)"
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="8"
                placeholder="உங்கள் கேள்வி, ஆசி, உள்நுழைவு கோரிக்கை அல்லது ஞானத்தேடல்... இங்கு எழுதுங்கள் *"
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <Loader size="small" />
              ) : (
                <>
                  <FaPaperPlane /> செய்தியை அனுப்பு
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;