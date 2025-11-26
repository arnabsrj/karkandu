// src/pages/admin/Analytics/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaHeart, FaComment, FaClock, FaUsers, FaMousePointer } from 'react-icons/fa';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import './Analytics.css';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/interactions');

        setAnalytics({
          stats: res.data.data || [],
          summary: res.data.summary || {},
        });

        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loader message="Gathering sacred insights..." />;
  if (error) return <p className="error-msg">{error}</p>;
  if (!analytics) return <p>No analytics data yet.</p>;

  const stats = analytics.stats || [];
  const summary = analytics.summary || {};

  console.log('Blog Stats:', stats);

  return (
    <div className="analytics-page">
      <div className="admin-card">
        <h2 className="admin-page-title">Blog Analytics</h2>
        <p>View engagement, views, and insights for your spiritual writings</p>

        {/* ---------------------- Summary Section ---------------------- */}
        <section className="summary-section">
          <h3>Overall Insights</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <FaEye className="stat-icon view" />
              <h4>{summary.totalViews || 0}</h4>
              <p>Total Views</p>
            </div>

            <div className="stat-card">
              <FaMousePointer className="stat-icon click" />
              <h4>{summary.totalClicks || 0}</h4>
              <p>Total Clicks</p>
            </div>

            <div className="stat-card">
              <FaHeart className="stat-icon like" />
              <h4>{summary.totalLikes || 0}</h4>
              <p>Total Likes</p>
            </div>

            <div className="stat-card">
              <FaComment className="stat-icon comment" />
              <h4>{summary.totalComments || 0}</h4>
              <p>Total Comments</p>
            </div>

            <div className="stat-card">
              <FaUsers className="stat-icon user" />
              <h4>{summary.uniqueUsers || 0}</h4>
              <p>Unique Users</p>
            </div>

            <div className="stat-card">
              <FaClock className="stat-icon time" />
              <h4>{summary.avgReadTimeOverall || 0} sec</h4>
              <p>Avg Read Time</p>
            </div>
          </div>
        </section>

        {/* ---------------------- Per Blog Section ---------------------- */}
        <section className="blogs-analytics">
          <h3>Per-Blog Analytics</h3>

          <table className="analytics-table">
            <thead>
              <tr>
                <th>Blog Title</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Reads</th>
                <th>Avg Read Time</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Unique Users</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(stats) && stats.length > 0 ? (
                stats.map((blog) => (
                  <tr key={blog.blogId}>
                    <td className="blog-title">{blog.title}</td>
                    <td>{blog.views}</td>
                    <td>{blog.clicks}</td>
                    <td>{blog.reads}</td>
                    <td>{blog.avgReadTime} sec</td>
                    <td>{blog.likes}</td>
                    <td>{blog.comments}</td>
                    <td>{blog.uniqueUsers}</td>
                    <td>
                      <Link 
                        to={`/admin/analytics/blog/${blog.blogId}`}
                        className="detail-btn"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No blog analytics found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
