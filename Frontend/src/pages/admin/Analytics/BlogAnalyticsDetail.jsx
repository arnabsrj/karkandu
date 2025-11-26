// src/pages/admin/Analytics/BlogAnalyticsDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEye, FaHeart, FaComment, FaClock, FaUsers, FaArrowLeft } from 'react-icons/fa';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import './BlogAnalyticsDetail.css';

const BlogAnalyticsDetail = () => {
  const { blogId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Received blogId:', blogId); // ← ADD THIS
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/admin/interactions/${blogId}`);
        setDetail(res.data.data || res.data);
      } catch (err) {
        setError('Failed to load blog analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [blogId]);

  if (loading) return <Loader message="Loading sacred insights..." />;
  if (error) return <p className="error-msg">{error}</p>;
  if (!detail) return <p>No data found for this blog.</p>;

  return (
    <div className="blog-analytics-detail">
      <div className="admin-card">
        <div className="header">
          <Link to="/admin/analytics" className="back-btn">
            <FaArrowLeft /> Back to Analytics
          </Link>
          <h2>{detail.title || 'Untitled Blog'}</h2>
          <p>Detailed engagement & reader behavior</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card large">
            <FaEye className="icon view" />
            <h3>{detail.views || 0}</h3>
            <p>Total Views</p>
          </div>
          <div className="stat-card large">
            <FaHeart className="icon like" />
            <h3>{detail.likes || 0}</h3>
            <p>Total Likes</p>
          </div>
          <div className="stat-card large">
            <FaComment className="icon comment" />
            <h3>{detail.comments || 0}</h3>
            <p>Total Comments</p>
          </div>
          <div className="stat-card large">
            <FaClock className="icon time" />
            <h3>{Math.round(detail.avgReadTime || 0)} sec</h3>
            <p>Avg Read Time</p>
          </div>
          <div className="stat-card large">
            <FaUsers className="icon user" />
            <h3>{detail.uniqueUsers || 0}</h3>
            <p>Unique Readers</p>
          </div>
        </div>

        <section className="extra-insights">
          <h3>Reader Engagement Insights</h3>
          <div className="insight-grid">
            <div className="insight">
              <strong>Completion Rate:</strong> {detail.reads && detail.views ? Math.round((detail.reads / detail.views) * 100) : 0}%
            </div>
            <div className="insight">
              <strong>Engagement Score:</strong> {((detail.likes + detail.comments) / (detail.views || 1) * 100).toFixed(1)}%
            </div>
            <div className="insight">
              <strong>Most Active Time:</strong> Coming soon
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogAnalyticsDetail;