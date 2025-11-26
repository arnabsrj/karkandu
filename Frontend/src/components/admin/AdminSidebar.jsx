// src/components/admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBookOpen, 
  FaUsers, 
  FaComments, 
  FaEnvelope,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaLeaf
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { to: '/admin/blogs', icon: FaBookOpen, label: 'Manage Blogs' },
    { to: '/admin/add-user', icon: FaUserPlus, label: 'Add New User' },  // NEW
    { to: '/admin/users', icon: FaUsers, label: 'Manage Users' },
    { to: '/admin/comments', icon: FaComments, label: 'Comments' },
    { to: '/admin/contacts', icon: FaEnvelope, label: 'Contact Messages' },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FaLeaf className="logo-icon" />
          {!isCollapsed && <span className="logo-text">Tamil Sage Admin</span>}
        </div>
        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
                end
              >
                <item.icon className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;