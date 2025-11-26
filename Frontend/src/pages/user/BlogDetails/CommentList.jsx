// src/pages/user/BlogDetails/CommentList.jsx
import React, { useEffect, useState } from 'react';
import { useBlog } from '../../../context/BlogContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../../components/common/Loader.jsx';
import { FaHeart, FaRegHeart, FaReply, FaUserCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CommentList.css';

const CommentList = ({ blogId }) => {
  const { comments, fetchComments, loading, error, likeComment, addComment } = useBlog();
  // const { isAuthenticated } = useAuth();
  const { user, isAuthenticated } = useAuth();
const { deleteComment } = useBlog();


  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  
  // NEW: State for "Show all comments"
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    fetchComments(blogId);
  }, [blogId, fetchComments]);

  // Show only latest 3 by default
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    const newReply = await addComment(blogId, replyText, parentId);
    if (newReply) {
      fetchComments(blogId);
    }
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderComment = (comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies[comment._id] || false;

    // [FIX] Robust check for ownership
  // 1. Get the logged-in user's ID safely
  const currentUserId = user?._id || user?.id; 

  // 2. Get the comment author's ID safely (handles populated object OR raw string ID)
  const commentUserId = comment.user?._id || comment.user?.id || comment.user;

  // 3. Compare them as strings to avoid object/string mismatch
  const isOwner = currentUserId && commentUserId && currentUserId.toString() === commentUserId.toString();

    return (
      <div
        key={comment._id}
        className={`comment-item ${depth > 0 ? 'reply' : ''}`}
        style={{ marginLeft: `${depth * 2}rem` }}
      >
        {/* Your existing comment markup (unchanged) */}
        <div className="comment-header">
          <div className="comment-avatar">
            {comment.user?.avatar ? (
              <img src={comment.user.avatar} alt={comment.user.name} />
            ) : (
              <FaUserCircle />
            )}
          </div>
          <div className="comment-meta">
            <p className="comment-author">{comment.user?.name || 'Anonymous'}</p>
            <p className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="comment-content">
          <p>{comment.content}</p>
        </div>



        {/* <div className="comment-actions">
          <button onClick={() => likeComment(comment._id)} className={`like-btn ${comment.isLiked ? 'liked' : ''}`}>
            {comment.isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{comment.likeCount}</span>
          </button>

          {isAuthenticated && (
            <button className="reply-btn" onClick={() => setReplyingTo(comment._id)}>
              <FaReply />
              <span>Reply</span>
            </button>
          )}
        </div> */}

  <div className="comment-actions">
        {/* Like button */}
        <button
          onClick={() => likeComment(comment._id)}
          className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
        >
          {comment.isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{comment.likeCount}</span>
        </button>

        {/* Reply button */}
        {isAuthenticated && (
          <button
            className="reply-btn"
            onClick={() => setReplyingTo(comment._id)}
          >
            <FaReply />
            <span>
              {/* Reply */}
               பதில்
            </span>
          </button>
        )}

        {/* [FIXED] DELETE BUTTON — Uses our new safe 'isOwner' check */}
        {isAuthenticated && isOwner && (
          <button
            onClick={() => {
              if (confirm("Delete this comment?")) {
                deleteComment(comment._id).then(() => fetchComments(blogId));
              }
            }}
            className="delete-btn"
            style={{
              marginLeft: "10px",
              color: "red",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            {/* Delete */}
            நீக்கு
          </button>
        )}
      </div>




        {/* Reply Form */}
        {replyingTo === comment._id && (
          <div className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your reflection..."
              rows="2"
            />
            <div className="reply-actions">
              <button onClick={() => handleReplySubmit(comment._id)} disabled={!replyText.trim()}>
                Send
              </button>
              <button onClick={() => setReplyingTo(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Replies Toggle */}
        {hasReplies && (
          <button onClick={() => toggleReplies(comment._id)} className="replies-toggle">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            <span> {isExpanded ? 'Hide' : 'Read'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}

        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="replies">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-list">
      <h3 className="comments-title">
        பிரதிபலிப்புகள் ({comments.length})
      </h3>

      <div className="comments-thread">
        {visibleComments.map((comment) => renderComment(comment))}
      </div>

      {/* "Read All Reflections" Button */}
      {comments.length > 3 && !showAllComments && (
        <div className="load-all-comments">
          <button
            onClick={() => setShowAllComments(true)}
            className="load-all-btn"
          >
            அனைத்தையும் படியுங்கள் {comments.length} பிரதிபலிப்புகள்
            <FaChevronDown className="icon" />
          </button>
        </div>
      )}

      {/* Optional: "Collapse" button after expanding */}
      {showAllComments && comments.length > 3 && (
        <div className="load-all-comments">
          <button
            onClick={() => setShowAllComments(false)}
            className="load-all-btn collapse"
          >
            குறைவாகக் காட்டு
            <FaChevronUp className="icon" />
          </button>
        </div>
      )}
    </div>
  );
};  

export default CommentList;