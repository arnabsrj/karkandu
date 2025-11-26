// src/pages/user/About/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaHeart, FaFeatherAlt, FaHandsHelping } from 'react-icons/fa';
import { TAMIL } from '../../../utils/tamilText.js'; // Import the dictionary
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">{TAMIL.aboutHeroTitle}</h1>
          <p className="hero-subtitle">
            {TAMIL.aboutHeroSubtitle}
          </p>
        </div>
        <div className="hero-decoration">
          <FaLeaf className="leaf left" />
          <FaLeaf className="leaf right" />
        </div>
      </section>

      {/* Introduction */}
      <section className="about-section">
        <div className="container">
          <div className="intro-grid">
            <div className="intro-text">
              <h2>{TAMIL.aboutIntroTitle}</h2>
              <p>{TAMIL.aboutIntroP1}</p>
              <p>{TAMIL.aboutIntroP2}</p>
            </div>
            <div className="intro-image">
              <div className="image-placeholder">
                <FaFeatherAlt className="feather-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">{TAMIL.aboutMissionTitle}</h2>
          <div className="values-grid">
            
            {/* Value 1 */}
            <div className="value-card">
              <FaHeart className="value-icon" />
              <h3>{TAMIL.value1Title}</h3>
              <p>{TAMIL.value1Desc}</p>
            </div>

            {/* Value 2 */}
            <div className="value-card">
              <FaHandsHelping className="value-icon" />
              <h3>{TAMIL.value2Title}</h3>
              <p>{TAMIL.value2Desc}</p>
            </div>

            {/* Value 3 */}
            <div className="value-card">
              <FaLeaf className="value-icon" />
              <h3>{TAMIL.value3Title}</h3>
              <p>{TAMIL.value3Desc}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Closing Invitation */}
      <section className="invitation-section">
        <div className="container">
          <div className="invitation-card">
            <h2>{TAMIL.inviteTitle}</h2>
            <p>{TAMIL.inviteText}</p>
            <Link to="/blogs" className="cta-button">
              {TAMIL.exploreWritings}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="about-footer">
        <p>
          {TAMIL.footerSign} · <strong>{TAMIL.siteName}</strong>
        </p>
      </footer>
    </div>
  );
};

export default About;