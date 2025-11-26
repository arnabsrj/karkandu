import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlog } from '../../../context/BlogContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import { FaHeart, FaRegHeart, FaComment, FaClock, FaUser, FaArrowRight, FaEye, FaSearch } from 'react-icons/fa';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import ShareButtons from './ShareButtons';
import api from '../../../services/api.js';
import './BlogDetails.css';
import RecommendedBlogs from './RecommendedBlogs.jsx';

// Import the Tamil Dictionary
import { TAMIL } from '../../../utils/tamilText.js';


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



const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    fetchBlogBySlug, 
    currentBlog, 
    toggleLike, 
    addComment, 
    trackReadTime,
    trackView, 
    loading, 
    error
  } = useBlog();
  const { isAuthenticated } = useAuth();


  const [latestBlogs, setLatestBlogs] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [readStartTime, setReadStartTime] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);


  // 1. Add state for subscription
const [subEmail, setSubEmail] = useState('');
const [subStatus, setSubStatus] = useState(''); // 'loading', 'success', 'error'
const [subMessage, setSubMessage] = useState('');

// 2. Add handle function
const handleSubscribe = async (e) => {
  e.preventDefault();
  if (!subEmail) return;
  
  setSubStatus('loading');
  try {
    await api.post('/user/subscribe', { email: subEmail }); // Ensure this route exists
    setSubStatus('success');
    setSubMessage('நன்றி! தங்களின் சந்தா சேர்க்கப்பட்டது.'); // "Thank you! Subscribed."
    setSubEmail('');
  } catch (err) {
    setSubStatus('error');
    setSubMessage(err.response?.data?.message || 'Something went wrong.');
  }
};


  // 2. New State for Local Category Viewing
  const [activeCategory, setActiveCategory] = useState(null); // 'yoga', 'wellness', etc.
  const [categoryBlogs, setCategoryBlogs] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

    // 2. Add Search State
  // const [searchTerm, setSearchTerm] = useState('');

  // Handle Search Submit from Details Page
  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   if (searchTerm.trim()) {
  //      navigate(`/blogs?search=${encodeURIComponent(searchTerm)}`);
  //   }
  // };

 // 3. Handle Category Click (Fetch data locally instead of navigating away)
  const handleCategoryClick = async (catId) => {
    // If clicking the active one, toggle it off (return to article)
    if (activeCategory === catId) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory(catId);
    setCategoryLoading(true);
    try {
      // Fetch blogs for this category specifically
      const res = await api.get(`/user/blogs?category=${catId}`);
      setCategoryBlogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to load category blogs", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Reset category view when slug changes (so new article shows up)
  useEffect(() => {
    setActiveCategory(null);
  }, [slug]);

  // Fetch main blog
  useEffect(() => {
    const loadBlog = async () => {
      const blog = await fetchBlogBySlug(slug);
      if (!blog) {
        navigate('/not-found', { replace: true });
      } else {
        setReadStartTime(Date.now());
        trackView(blog.id);  
      }
    };
    loadBlog();
  }, [slug, fetchBlogBySlug, navigate]);

  // Fetch Latest & Related Blogs
  useEffect(() => {
    const fetchSidebarBlogs = async () => {
      try {
        setSidebarLoading(true);
        const res = await api.get('/user/blogs');
        const allBlogs = res.data.data || res.data;

        const others = allBlogs.filter(b => b.slug !== slug);

        const latest = [...others]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 6);

        if (currentBlog?.tags) {
          const related = others
            .filter(b => b.tags?.some(tag => currentBlog.tags.includes(tag)))
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, 6);
          setRelatedBlogs(related.length > 0 ? related : latest.slice(0, 4));
        } else {
          setRelatedBlogs(latest.slice(0, 4));
        }

        setLatestBlogs(latest);
      } catch (err) {
        console.error("Failed to load sidebar blogs");
      } finally {
        setSidebarLoading(false);
      }
    };

    if (currentBlog) fetchSidebarBlogs();
  }, [currentBlog, slug]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track read time
  useEffect(() => {
    return () => {
      if (readStartTime && currentBlog && isAuthenticated) {
        const duration = Math.floor((Date.now() - readStartTime) / 1000);
        if (duration > 10) trackReadTime(currentBlog.id, duration);
      }
    };
  }, [readStartTime, currentBlog, isAuthenticated, trackReadTime]);

  // Helper for Tamil Date Formatting
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ta-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) return <Loader message={TAMIL.loadingWisdom} />;
  if (error || !currentBlog) return <div className="error-msg">{error || TAMIL.blogNotFound}</div>;

  const { title, content, featuredImage, author, publishedAt, tags, likeCount, isLiked, commentCount } = currentBlog;

  const BlogGridCard = ({ blog }) => (
    <Link to={`/blogs/${blog.slug}`} className="blog-grid-card">
      <div className="grid-card-img">
        <img src={blog.featuredImage || '/placeholder.jpg'} alt={blog.title} />
      </div>
      <div className="grid-card-content">
        <h4>{blog.title}</h4>
        <div className="grid-card-meta">
          <FaClock />
          {/* Short date format in Tamil */}
          {new Date(blog.publishedAt).toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    </Link>
  );

return (
    <>
      <div className="reading-progress-container">
        <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="sacred-blog-page">
        <div className="sacred-container">

          {/* 4. NEW CATEGORY BAR (No Search) */}
          <div className="blog-details-nav-section">
             <div className="category-nav">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
          </div>

          {/* 5. CONDITIONAL RENDER: Show Category Grid OR Single Article */}
          {activeCategory ? (
            // --- CATEGORY VIEW MODE ---
            <div className="category-results-container">
               {categoryLoading ? (
                 <Loader message="Loading category..." />
               ) : (
                 <div className="blogs-grid">
                    {categoryBlogs.length === 0 ? (
                      <p className="no-results">No blogs found in this category.</p>
                    ) : (
                      categoryBlogs.map((blog) => (
                        <article key={blog._id || blog.id} className="blog-card">
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
                                {blog.excerpt && blog.excerpt.length > 90 
                                  ? blog.excerpt.substring(0, 90) + '...' 
                                  : blog.excerpt}
                              </p>
                              <div className="blog-meta">
                                <span className="meta-author">
                                  <FaUser /> {blog.author?.name || 'Sage'}
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
               )}
            </div>
          ) : (
            // --- SINGLE ARTICLE VIEW MODE ---
            <div className="sacred-layout">
              <main className="sacred-article sacred-article--full">
                <img src={featuredImage || 'https://via.placeholder.com/1400x700'} alt={title} className="featured-image" />
                <h1 className="article-title mega">{title}</h1>
                
                <div className="article-meta">
                  <span><FaUser /> {author?.name || 'Tamil Sage'}</span>
                  <span><FaClock /> {formatDate(publishedAt)}</span>
                  <span><FaEye /> {currentBlog.viewsCount || 0} {TAMIL.views}</span>
                </div>
                
                <div className="article-tags">
                  {tags?.map((tag, i) => <span key={i}>#{tag}</span>)}
                </div>

                <div className="article-inner" dangerouslySetInnerHTML={{ __html: content }} />

                <div className="sacred-actions">
                  <button onClick={() => toggleLike(currentBlog.id)} className={`sacred-btn ${isLiked ? 'liked' : ''}`}>
                    {isLiked ? <FaHeart /> : <FaRegHeart />} {likeCount}
                  </button>
                  <button className="sacred-btn comment">
                    <FaComment /> {commentCount}
                  </button>
                  <ShareButtons title={title} />
                </div>

                {isAuthenticated ? (
                  <CommentForm blogId={currentBlog.id} onComment={addComment} />
                ) : (
                  <div className="sacred-prompt">
                    <p>
                      <Link to="/login">{TAMIL.loginLinkText}</Link> {TAMIL.loginPrompt}
                    </p>
                  </div>
                )}

                <CommentList blogId={currentBlog.id} />
              </main>

              {/* Sidebar */}
              <aside className="sacred-sidebar">

                {/* --- NEW SUBSCRIBE BOX --- */}
 <div className="sidebar-section newsletter-box">
  <div className="newsletter-header">
    <h3 className="newsletter-title">ஆன்மீக மடல்</h3>
    <p className="newsletter-subtitle">
      புதிய ஞான ஒளி உங்கள் மடலுக்கு வரும்...
    </p>
  </div>

  <form onSubmit={handleSubscribe} className="newsletter-form">
    <div className="newsletter-input-wrapper">
      <input
        type="email"
        placeholder="உங்கள் மின்னஞ்சல்"
        value={subEmail}
        onChange={(e) => setSubEmail(e.target.value)}
        required
        disabled={subStatus === 'success'}
        className="newsletter-input"
      />
    </div>

    <button 
      type="submit" 
      disabled={subStatus === 'loading' || subStatus === 'success'}
      className={`newsletter-btn ${subStatus}`}
    >
      {subStatus === 'loading' ? (
        <>பதிவு செய்கிறது...</>
      ) : subStatus === 'success' ? (
        <>பதிவு செய்யப்பட்டது</>
      ) : (
        <>பதிவு செய்யவும்</>
      )}
    </button>
  </form>

  {/* Success / Error Message */}
  {subMessage && (
    <div className={`newsletter-message ${subStatus}`}>
      {subStatus === 'success' ? (
        <p>உங்கள் ஆன்மா இப்போது எங்கள் பயணத்தில் இணைந்துவிட்டது</p>
      ) : (
        <p>{subMessage}</p>
      )}
    </div>
  )}
</div>
  {/* ------------------------- */}
  
                <div className="sidebar-section">
                  <h3 className="flow-title">{TAMIL.relatedReadings}</h3>
                  {sidebarLoading ? <p className="sidebar-loading">{TAMIL.searchingWisdom}</p> : (
                    relatedBlogs.length > 0 ? (
                      <>
                        <div className="blog-grid">
                          {relatedBlogs.slice(0, 3).map(blog => (
                            <BlogGridCard key={blog._id || blog.id} blog={blog} />
                          ))}
                        </div>
                        <Link to="/blogs?related=true" className="sidebar-view-all">
                          {TAMIL.viewAllRelated} <FaArrowRight />
                        </Link>
                      </>
                    ) : <p className="no-related">{TAMIL.noRelated}</p>
                  )}
                </div>

                <div className="sidebar-section">
                  <h3 className="flow-title">{TAMIL.latestWisdom}</h3>
                  {sidebarLoading ? <p className="sidebar-loading">{TAMIL.loading}</p> : (
                    latestBlogs.length > 0 ? (
                      <>
                        <div className="blog-grid">
                          {latestBlogs.slice(0, 3).map(blog => (
                            <BlogGridCard key={blog._id || blog.id} blog={blog} />
                          ))}
                        </div>
                        <Link to="/blogs" className="sidebar-view-all">
                          {TAMIL.viewAllLatest} <FaArrowRight />
                        </Link>
                      </>
                    ) : <p>{TAMIL.noRecent}</p>
                  )}
                </div>
              </aside>
            </div>
          )}

          {/* Bottom Mobile Sidebar - Only show if not in category view */}
          {!activeCategory && (
            <div className="sacred-sidebar-mobile">
              <div className="sidebar-section">
                <h3 className="flow-title">{TAMIL.relatedReadings}</h3>
                <div className="blog-grid">
                  {relatedBlogs.slice(0, 3).map(blog => (
                    <BlogGridCard key={blog._id} blog={blog} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommended - Only show if not in category view */}
          {!activeCategory && <RecommendedBlogs currentBlog={currentBlog} />}
          
        </div>
      </div>
    </>
  );
};

export default BlogDetails;