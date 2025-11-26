// src/pages/user/BlogDetails/RecommendedBlogs.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api.js';
import { FaHeart, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './RecommendedBlogs.css';

const RecommendedBlogs = ({ currentBlog }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // NEW: Toggle state

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentBlog) return;

      try {
        const res = await api.get('/user/blogs');
        const allBlogs = res.data.data || [];

        let candidates = allBlogs.filter(b => b.slug !== currentBlog.slug);

        const scored = candidates.map(blog => {
          const tagMatch = blog.tags?.filter(tag => 
            currentBlog.tags?.includes(tag)
          ).length || 0;

          const categoryMatch = blog.category === currentBlog.category ? 3 : 0;
          const subcategoryMatch = blog.subcategory === currentBlog.subcategory ? 2 : 0;

          return {
            blog,
            score: tagMatch * 5 + categoryMatch + subcategoryMatch
          };
        });

        const sorted = scored
          .sort((a, b) => b.score - a.score || new Date(b.blog.publishedAt) - new Date(a.blog.publishedAt))
          .slice(0, 6)
          .map(item => item.blog);

        setRecommendations(sorted.length > 0 ? sorted : candidates.slice(0, 6));
      } catch (err) {
        console.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentBlog]);

  if (loading || recommendations.length === 0) return null;

  const visibleBlogs = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <section className="recommended-section">
      <div className="container">
        <h2 className="recommended-title">
          நீங்களும் விரும்பலாம்
        </h2>

        <div className="recommended-grid">
          {visibleBlogs.map(blog => (
            <Link key={blog._id} to={`/blogs/${blog.slug}`} className="recommended-card">
              <div className="recommended-img">
                <img src={blog.featuredImage || '/placeholder.jpg'} alt={blog.title} />
                <div className="img-overlay">
                  <span className="read-more">மேலும் படிக்க</span>
                </div>
              </div>
              <div className="recommended-content">
                <h3>{blog.title}</h3>
                <div className="recommended-meta">
                  <span><FaClock /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  {blog.likeCount > 0 && (
                    <span><FaHeart /> {blog.likeCount}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* "Click to Read More" Button */}
        {recommendations.length > 3 && (
          <div className="read-more-cta">
            <button
              onClick={() => setShowAll(!showAll)}
              className="read-more-btn"
            >
              {showAll ? (
                <>குறைவாகக் காட்டு <FaChevronUp /></>
              ) : (
                <>மேலும் படிக்க கிளிக் செய்யவும் <FaChevronDown /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedBlogs;