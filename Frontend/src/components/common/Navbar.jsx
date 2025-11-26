// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUserCog, FaBell, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBlog } from '../../context/BlogContext.jsx';
import logo from '../../assets/images/my-logo.png';
import { TAMIL } from '../../utils/tamilText.js';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications } = useBlog();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    setIsMobileMenuOpen(false);
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link logo-link">
            <img src={logo} alt="Tamil Sage Logo" className="navbar-logo" />
          </Link>
        </div>

        {/* Hamburger */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
        </button>

        {/* Menu */}
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          
          {/* Main Links */}
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {TAMIL.home}
            </Link>
            <Link to="/blogs" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {TAMIL.blogs}
            </Link>
            <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {TAMIL.about}
            </Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {TAMIL.contact}
            </Link>
          </div>

          {/* Auth Section */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="auth-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaUserCircle size={18} />
                  <span className="auth-text">{user?.name || TAMIL.profile}</span>
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="auth-link" onClick={() => setIsMobileMenuOpen(false)}>
                    <FaUserCog size={18} />
                    <span className="auth-text">{TAMIL.admin}</span>
                  </Link>
                )}

                <Link to="/notifications" className="auth-link notification-wrapper" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaBell size={20} className="bell-icon" />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>

                <button onClick={handleLogout} className="auth-link logout-btn">
                  <FaSignOutAlt size={18} />
                  <span className="auth-text">{TAMIL.logout}</span>
                </button>
              </>
            ) : (
              <>
                {/* ONLY LOGIN — NO REGISTER */}
                <Link to="/login" className="auth-link login-only" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaUserCircle size={18} />
                  <span className="auth-text">{TAMIL.login}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu} />}
    </nav>
  );
};

export default Navbar;