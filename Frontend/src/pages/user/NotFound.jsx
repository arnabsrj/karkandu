// src/pages/user/NotFound/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCompass, FaHeart } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-container">
        
        <div className="notfound-content">
          <h1 className="error-code">நாநூறூ நான்கு</h1>
          <h2 className="error-title">பாதை மறைக்கப்பட்டுள்ளது</h2>
          <p className="error-message">
          நீங்கள் தேடும் ஞானம் இங்கே இல்லை... இன்னும்.  
            <br />
           சில நேரங்களில் பிரபஞ்சம் நம்மை ஆழமான உண்மைகளுக்கு மாற்றுப்பாதைகள் வழியாக வழிநடத்துகிறது.
          </p>

          <div className="notfound-actions">
            <Link to="/" className="home-btn">
              <FaHome /> வீட்டிற்குத் திரும்பு
            </Link>
            <Link to="/blogs" className="explore-btn">
              <FaCompass /> வலைப்பதிவுகளை ஆராயுங்கள்
            </Link>
          </div>

          <div className="notfound-footer">
            <p>
              கொண்டு செய்யப்பட்டது <FaHeart className="heart-icon" /> ஆன்மாவின் அமைதியில்
            </p>
          </div>
        </div>

        <div className="notfound-decoration">
          <div className="lotus-flower"></div>
          <div className="floating-petal petal-1"></div>
          <div className="floating-petal petal-2"></div>
          <div className="floating-petal petal-3"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;