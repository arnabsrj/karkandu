// src/pages/user/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import { FaEdit, FaHeart, FaComment, FaEye, FaUserCircle, FaSave, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  // We now get updateProfile from AuthContext
  const { user, updateProfile, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({ name: form.name, bio: form.bio });
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <Loader message="Awakening your soul profile..." />;
  if (!user) return <p className="error-msg">Please log in to view your profile.</p>;

  // ✅ REAL DATA: Get liked blogs directly from user object (populated by backend)
  const likedBlogs = user.likedBlogs || [];
  const commentCount = user.commentedBlogs ? user.commentedBlogs.length : 0;
  // If you are tracking viewCount in user model, use it, otherwise 0
  const viewCount = user.viewCount || 0; 

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}
        <header className="profile-header">
          <div className="avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar" />
            ) : (
              <FaUserCircle className="avatar-placeholder" />
            )}
            {/* Future: Add Avatar Upload here */}
            {/* <button className="edit-avatar-btn"><FaEdit /></button> */}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your sacred name"
                  className="edit-input"
                />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="edit-input disabled"
                />
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Share your spiritual journey..."
                  rows="3"
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">
                    <FaSave /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{user.name}</h1>
                <p className="profile-email">{user.email}</p>
                {user.bio ? (
                  <p className="profile-bio">{user.bio}</p>
                ) : (
                  <p className="profile-bio-placeholder">Add a bio to share your journey...</p>
                )}
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  <FaEdit /> Edit Profile
                </button>
              </>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <FaHeart className="stat-icon" />
            <p className="stat-number">{likedBlogs.length}</p>
            <p className="stat-label">Liked Writings</p>
          </div>
          <div className="stat-card">
            <FaComment className="stat-icon" />
            <p className="stat-number">{commentCount}</p>
            <p className="stat-label">Reflections</p>
          </div>
          {/* Optional: Views */}
          {/* <div className="stat-card">
            <FaEye className="stat-icon" />
            <p className="stat-number">{viewCount}</p>
            <p className="stat-label">Read Time</p>
          </div> */}
        </div>

        {/* Liked Blogs */}
        <section className="liked-blogs">
          <h2 className="section-title">Wisdom You Love</h2>
          {likedBlogs.length === 0 ? (
            <p className="no-likes">
              You haven't liked any writings yet. <Link to="/blogs">Explore</Link> the library.
            </p>
          ) : (
            <div className="liked-grid">
              {likedBlogs.map((blog) => (
                <Link key={blog._id} to={`/blogs/${blog.slug}`} className="liked-card">
                  <img 
                    src={blog.featuredImage || '/placeholder.jpg'} 
                    alt={blog.title} 
                    className="liked-image" 
                  />
                  <div className="liked-content">
                    <h3 className="liked-title">{blog.title}</h3>
                    <p className="liked-excerpt">
                      {blog.excerpt ? blog.excerpt.substring(0, 80) + '...' : 'Read more...'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;