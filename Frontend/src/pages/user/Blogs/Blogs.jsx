// src/pages/user/Blogs/Blogs.jsx
import React, { useState, useEffect } from 'react';
import { useBlog } from '../../../context/BlogContext.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../../../components/common/Loader.jsx';
import { FaSearch, FaCalendarAlt, FaUser, FaClock, FaEye, FaChevronRight } from 'react-icons/fa';
import './Blogs.css';

// Defined based on your image structure
const CATEGORIES = [
  { 
    id: 'meditation', 
    label: 'முகப்பு', 
    subcategories: [] 
  },
  { 
    id: 'yoga', 
    label: 'ஆன்மீகம்', 
    subcategories: ['ஸ்தல வரலாறு', 'மந்திரம்', 'பக்தி பாடல்', 'பக்தி கதை'] 
  },
  { 
    id: 'spirituality', 
    label: 'ராசி பலன்', 
    subcategories: ['தினப்பலன்', 'வார பலன்', 'ஆண்டு பலன்'] 
  },
  { 
    id: 'wellness', 
    label: 'நாமும் தெரிந்துக்கொள்வோம்', 
    subcategories: ['அழகு குறிப்பு', 'சமையல் குறிப்பு', 'தொழில் நுட்பம்', 'பாட்டி வைத்தியம்', 'மற்றவை'] 
  }
];

const params = new URLSearchParams();


const Blogs = () => {
  const { blogs, fetchBlogs, loading, error, pagination } = useBlog();
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams(); // 2. Initialize params

  // 3. Set initial state based on URL parameters (if they exist)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subcategory') || '');
  const [currentPage, setCurrentPage] = useState(1);
// 4. Add this useEffect to listen for URL changes
  useEffect(() => {
    const catParam = searchParams.get('category');
    const subParam = searchParams.get('subcategory');
    if (catParam && catParam !== selectedCategory) setSelectedCategory(catParam);
    if (subParam && subParam !== selectedSubCategory) setSelectedSubCategory(subParam);
  }, [searchParams]);

  // Fetch based on category/subcategory
  useEffect(() => {
    fetchBlogs({ 
      search, 
      category: selectedCategory, 
      subcategory: selectedSubCategory, 
      page: currentPage 
    });
  }, [search, selectedCategory, selectedSubCategory, currentPage, fetchBlogs]);


  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle Main Category Click
  const handleCategoryClick = (catId) => {
    // If clicking the same category, deselect it (optional, or just keep it active)
    if (selectedCategory === catId) {
      setSelectedCategory('');
      setSelectedSubCategory('');
    } else {
      setSelectedCategory(catId);
      setSelectedSubCategory(''); // Reset subcategory when switching main category
    }
    setCurrentPage(1);
  };

  // Handle Sub Category Click
  const handleSubCategoryClick = (subName) => {
    setSelectedSubCategory(subName === selectedSubCategory ? '' : subName);
    setCurrentPage(1);
  };

  // Helper to get current active category object
  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  // if (loading && blogs.length === 0) return <Loader message="Gathering sacred writings..." />;
  // if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="sacred-blogs-page">
      <div className="sacred-container">

        {/* Header */}
        <header className="sacred-header">
          <h1 className="sacred-title">ஆன்மீக எழுத்துக்கள்</h1>
          <p className="sacred-subtitle">பண்டைய தமிழ் ஆன்மாக்களிடமிருந்து காலத்தால் அழியாத ஞானம்</p>
        </header>

        {/* Filter Section */}
        <div className="sacred-filters">
          
          {/* 1. Search Bar */}
          <form onSubmit={handleSearch} className="sacred-search-form">
            <input
              type="text"
              placeholder="Search sacred wisdom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>

          {/* 2. Main Categories Bar */}
          <div className="category-nav">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3. Sub-Categories Bar (Only shows if category selected & has subs) */}
          {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
            <div className="subcategory-nav fade-in">
              {/* <span className="sub-label"><FaChevronRight /></span> */}
              <div className="sub-flow">
                {activeCategoryObj.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleSubCategoryClick(sub)}
                    className={`subcategory-pill ${selectedSubCategory === sub ? 'active' : ''}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blogs Grid */}
        <div className="blogs-grid">
          {blogs.length === 0 ? (
            <p className="no-results">இன்னும் புனித எழுத்துக்கள் எதுவும் கிடைக்கவில்லை...</p>
          ) : (
            blogs.map((blog) => (
              <article key={blog.id} className="blog-card">
                <Link to={`/blogs/${blog.slug}`} className="blog-link">
                  <div className="blog-image-wrapper">
                    <img
                      src={blog.featuredImage || 'https://via.placeholder.com/400x250'}
                      alt={blog.title}
                      className="blog-image"
                    />
                    <div className="image-overlay">
                      <span className="read-more">மேலும் படிக்க</span>
                    </div>
                  </div>

                  <div className="blog-content">
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">
                      {blog.excerpt.length > 90 
                        ? blog.excerpt.substring(0, 90) + '...' 
                        : blog.excerpt}
                    </p>

                    <div className="blog-meta">
                      <span className="meta-author">
                        <FaUser /> {blog.author?.name || 'Tamil Sage'}
                      </span>
                      <span className="meta-date">
                        <FaCalendarAlt /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span className="meta-views">
                        <FaEye /> {blog.viewsCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="page-btn">
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {pagination.pages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={currentPage === pagination.pages} className="page-btn">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;