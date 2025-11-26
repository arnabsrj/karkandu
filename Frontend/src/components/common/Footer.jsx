// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaLeaf } from 'react-icons/fa';
import logo from '../../assets/images/my-logo.png'; // Your logo path

import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Top Section */}
        <div className="footer-top">
          
          {/* Brand + Logo */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <img 
                src={logo} 
                alt="Tamil Sage Logo" 
                className="footer-logo-img" 
              />
            </Link>
            <p className="footer-tagline">
              ஞானம் பூக்கும் இடம்
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="links-title">ஆராயுங்கள்</h3>
            <ul>
              <li><Link to="/">வீடு</Link></li>
              <li><Link to="/blogs">வலைப்பதிவுகள்</Link></li>
              <li><Link to="/about">பற்றி</Link></li>
              <li><Link to="/contact">தொடர்பு கொள்ளவும்</Link></li>
            </ul>
          </div>

          {/* Spiritual Touch */}
          <div className="footer-spiritual">
            <h3 className="spiritual-title">உள்ளே பயணம்</h3>
            <p className="spiritual-quote">
              "நீ தேடும் ஒளி உனக்குள் இருக்கிறது." <br />
              <span className="quote-author">- பண்டைய ஞானம்</span>
            </p>
            <div className="spiritual-icons">
              <FaLeaf className="icon-leaf" />
              <FaHeart className="icon-heart" />
              <FaLeaf className="icon-leaf" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} தாமரை வலைப்பதிவு. இதனுடன் உருவாக்கப்பட்டது <FaHeart className="heart-icon" /> இந்தியாவில்
          </p>
          <p className="blessing">
            அமைதியும் ஞானமும் உங்கள் பாதையை வழிநடத்தட்டும்
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;