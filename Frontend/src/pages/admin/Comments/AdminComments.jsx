// src/pages/admin/Comments/AdminComments.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import { FaTrash, FaUserCircle, FaCalendarAlt, FaHeart, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { getAdminComments, deleteComment } from '../../../services/adminService.js';
import './AdminComments.css';
// import {Tamil} from "../../../utils/tamilText.js"
import { TAMIL } from '../../../utils/tamilText.js'; 

const AdminComments = () => {
  const { isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      try {
        const res = await getAdminComments();
        setComments(res.data || []);
      } catch (err) {
        setError('Failed to load comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const handleDelete = async (id) => {
    if (!window.confirm('இந்த கருத்தை நிரந்தரமாக நீக்கவா?')) return;
    try {
      await deleteComment(id);
      setComments(prev => removeCommentById(prev, id));
      
      // Reset to page 1 if current page becomes empty
      // Note: We calculate logic on 'cleanComments' below, but for delete reset logic
      // simplistic check is usually fine.
      if (currentPage > 1) {
        setCurrentPage(1); 
      }
    } catch (err) {
      alert('நீக்குதல் தோல்வியடைந்தது');
    }
  };

  const removeCommentById = (list, id) => {
    return list
      .filter(c => c._id !== id)
      .map(c => ({
        ...c,
        replies: c.replies ? removeCommentById(c.replies, id) : []
      }));
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // --- START OF NEW LOGIC: DEDUPLICATION ---
  // 1. Find all IDs that exist inside 'replies' arrays
  const replyIds = new Set();
  comments.forEach(c => {
    if (c.replies && c.replies.length > 0) {
      c.replies.forEach(r => replyIds.add(r._id));
    }
  });

  // 2. Filter the main list. 
  // If a comment ID exists in 'replyIds', it's a child, so REMOVE it from the main list.
  const cleanComments = comments.filter(c => !replyIds.has(c._id));
  // --- END OF NEW LOGIC ---


  // --- PAGINATION (Updated to use 'cleanComments') ---
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = cleanComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(cleanComments.length / commentsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderComment = (comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments[comment._id];

    // Logic to get title safely
    const postTitle = comment.postId?.title || comment.postTitle || "Unknown Post";

    return (
      <div
        key={comment._id}
        className={`admin-comment-item ${depth > 0 ? 'is-reply' : ''}`}
        style={{ marginLeft: depth > 0 ? '40px' : '0', marginTop: depth > 0 ? '1rem' : '0' }}
      >
        <div className="comment-card">
          <div className="comment-header">
            <div className="author-info">
              {comment.authorAvatar ? (
                <img src={comment.authorAvatar} alt={comment.author} />
              ) : (
                <FaUserCircle className="avatar-placeholder" />
              )}
              <div>
                <strong className="author-name">{comment.author || 'Admin'}</strong>
                
                {/* Only show Blog Title on Depth 0 (Main Comments) */}
                {depth === 0 && comment.blogTitle && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#4f46e5', 
                    fontWeight: '600',
                    margin: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaExternalLinkAlt size={10} />
                    <span>On: {comment.blogTitle}</span>
                  </div>
                )}

                <small className="comment-date">
                  <FaCalendarAlt /> {new Date(comment.createdAt).toLocaleDateString('en-IN')}
                </small>
              </div>
            </div>
            <div className="comment-actions">
              <span className="like-count">
                <FaHeart /> {comment.likeCount || 0}
              </span>
              <button onClick={() => handleDelete(comment._id)} className="delete-btn" title="Delete">
                <FaTrash />
              </button>
            </div>
          </div>

          <div className="comment-body">
            <p>{comment.content}</p>
          </div>

          <div className="replies-section">
            <button onClick={() => toggleReplies(comment._id)} className="view-replies-btn">
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              <span>
                {isExpanded ? 'Hide Replies' : 'View Replies'} ({hasReplies ? comment.replies.length : 0})
              </span>
            </button>
          </div>

          {isExpanded && (
            <div className="replies-container">
              {hasReplies ? (
                comment.replies.map(reply => renderComment(reply, depth + 1))
              ) : (
                <p className="no-replies">No replies available</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <Loader message="Loading all comments & replies…" />;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="admin-comments-page">
      <h2 className="page-title">All Comments & Replies</h2>
      <div className="total-count">
        {/* Updated to show cleanComments.length */}
        Total Comments : {cleanComments.length} | Showing {indexOfFirstComment + 1}–{Math.min(indexOfLastComment, cleanComments.length)} of {cleanComments.length}
      </div>

      {cleanComments.length === 0 ? (
        <div className="no-comments">No comments yet.</div>
      ) : (
        <>
          <div className="comments-list">
            {currentComments.map(comment => renderComment(comment))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn prev"
              >
                <FaChevronLeft /> Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn next"
              >
               Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminComments;