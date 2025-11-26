// src/pages/user/Home-page/BlogCardsSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../../../context/BlogContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import '../../User-Css/Home-css/BlogCardsSection.css'; // Your existing CSS

const BlogCardsSection = () => {
  const { featuredBlogs, loading, error } = useBlog();
  const navigate = useNavigate();

  const handleBlogClick = (slug) => {
    navigate(`/blogs/${slug}`);
  };

  if (loading) return <Loader size="medium" message="Loading wisdom..." />;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <section className="blog-cards-section">
      <div className="container">
        <h2 className="section-title">Featured Wisdom</h2>
        <div className="blog-cards-grid">
          {featuredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="blog-card"
              onClick={() => handleBlogClick(blog.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div className="blog-image-wrapper">
                <img
                  src={blog.featuredImage || 'https://via.placeholder.com/400x250'}
                  alt={blog.title}
                  className="blog-image"
                />
                <div className="blog-overlay">
                  <span className="read-more">Read More</span>
                </div>
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-meta">
                  <span className="author">By {blog.author?.name || 'Sage'}</span>
                  <span className="date">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogCardsSection;