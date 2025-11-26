// src/pages/user/BlogDetails/CommentForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { TAMIL } from '../../../utils/tamilText.js'; // Import Tamil Dictionary
import './CommentForm.css';

const CommentForm = ({ blogId, onComment }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(TAMIL.errorEmptyComment);
      return;
    }
    
    if (content.length > 1000) {
      setError(TAMIL.errorTooLong);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const newComment = await onComment(blogId, content);
      if (newComment) {
        setContent('');
      }
    } catch (err) {
      setError(TAMIL.errorPostFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-form-container">
      <div className="comment-form-header">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar-img" />
          ) : (
            <FaUserCircle className="avatar-placeholder" />
          )}
        </div>
        <div className="user-info">
          {/* Display User Name (Database Name) or 'Seeker' in Tamil */}
          <p className="user-name">{user?.name || TAMIL.seeker}</p>
          <p className="user-role">{TAMIL.writingFromHeart}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={TAMIL.shareWisdomPlaceholder}
          className="comment-input"
          rows="4"
          disabled={loading}
        />
        <div className="form-actions">
          <span className="char-count">{content.length}/1000</span>
          
          <button type="submit" className="submit-btn" disabled={loading || !content.trim()}>
            {loading ? <Loader size="small" /> : <FaPaperPlane />}
            <span>{TAMIL.sendBtn}</span>
          </button>
        </div>
        
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
};

export default CommentForm;