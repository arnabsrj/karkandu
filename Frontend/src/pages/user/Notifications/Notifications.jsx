// src/pages/user/Notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import { FaBell, FaBlog, FaHeart, FaComment } from 'react-icons/fa';
import './Notifications.css';
import { TAMIL } from '../../../utils/tamilText.js';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/user/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await api.put('/user/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'new_blog': return <FaBlog className="icon blog" />;
      case 'comment_like': return <FaHeart className="icon like" />;
      case 'comment_reply': return <FaComment className="icon reply" />;
      default: return <FaBell className="icon" />;
    }
  };

  if (loading) return <Loader message="Loading your sacred messages..." />;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1><FaBell /> {TAMIL.notifications}</h1>
          {notifications.length > 0 && (
            <button onClick={markAllRead} className="mark-read-btn">
              {/* Mark all as read */}
              அனைத்தையும் படித்ததாகக் குறிக்கவும்
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="no-notifications">இன்னும் எந்த அறிவிப்பும் இல்லை. உங்கள் பயணம் அமைதியானது.</p>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div key={notif._id} className={`notification-item ${notif.read ? '' : 'unread'}`}>
                <div className="notif-icon">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                 <h4>
  {notif.fromUser?.name ? `${notif.fromUser.name} — ` : ''}
  {notif.title}
</h4>
                  <p>{notif.message}</p>
                  <div className="notif-meta">
                    <span className="time">
                      {new Date(notif.createdAt).toLocaleString('en-IN')}
                    </span>
                    {notif.relatedBlog && (
                      <Link to={`/blogs/${notif.relatedBlog.slug}`} className="notif-link">
                        View Blog
                      </Link>
                    )}
                  </div>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;