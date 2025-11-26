// src/context/BlogContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { API } from '../config.js';
import { useAuth } from './AuthContext.jsx';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);   // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();

  // ============================
  // ✅ Fetch Notifications
  // ============================
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await api.get('/user/notifications', { withCredentials: true });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, [isAuthenticated]);

  // ============================
  // Fetch all blogs
  // ============================
  const fetchBlogs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`${API.blogs.getAll}?${params}`);
      setBlogs(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================
  // Fetch featured blogs
  // ============================
  const fetchFeatured = useCallback(async () => {
    try {
      const res = await api.get(API.blogs.getFeatured);
      setFeaturedBlogs(res.data.data);
    } catch (err) {
      console.error('Failed to load featured blogs');
    }
  }, []);

  // ============================
  // Fetch single blog
  // ============================
  const fetchBlogBySlug = useCallback(async (slug) => {
    setLoading(true);
    try {
      const res = await api.get(API.blogs.getBySlug(slug));

      const blog = {
        ...res.data.data,
        id: res.data.data.id || res.data.data._id,
      };

      setCurrentBlog({
        ...blog,
        isLiked: false,
        likeCount: blog.likeCount || 0,
      });

      // Fetch like status
      // if (blog?.id) {
      //   try {
      //   const likeRes = await api.get(API.likes.status(blog.id));
      //     setCurrentBlog((prev) => ({
      //       ...prev,
      //       isLiked: likeRes.data.data.isLiked,
      //       likeCount: likeRes.data.data.likeCount,
      //     }));
      //   } catch (err) {
      //     console.error("Failed to fetch like status:", err);
      //   }
      // }
// Fetch like status
      if (blog?.id) {
        try {
          // ✅ FIX: Add { withCredentials: true } so the server knows WHO you are
          const likeRes = await api.get(API.likes.status(blog.id), { 
            withCredentials: true 
          });

          setCurrentBlog((prev) => ({
            ...prev,
            isLiked: likeRes.data.data.isLiked,
            likeCount: likeRes.data.data.likeCount,
          }));
        } catch (err) {
          console.error("Failed to fetch like status:", err);
        }
      }

      // Track view
      // if (isAuthenticated && blog?.id) {
      //   try {
      //     await api.post(API.interactions.track, { blogId: blog.id, type: 'view' });
      //   } catch (err) {
      //     console.error("Failed to track view:", err.response?.data);
      //   }
      // }

      setError(null);
      return blog;
    } catch (err) {
      setError(err.response?.data?.message || 'Blog not found');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================
  // Like blog
  // ============================
  // const toggleLike = useCallback(
  //   async (blogId) => {
  //     if (!isAuthenticated) return;

  //     try {
  //       const res = await api.post(API.likes.toggle(blogId));
  //       const { liked, likeCount } = res.data.data;

  //       if (currentBlog && currentBlog.id === blogId) {
  //         setCurrentBlog({ ...currentBlog, isLiked: liked, likeCount });
  //       }

  //       setBlogs((prev) =>
  //         prev.map((b) => (b.id === blogId ? { ...b, isLiked: liked, likeCount } : b))
  //       );

  //       return res.data;
  //     } catch (err) {
  //       setError('Failed to update like');
  //     }
  //   },
  //   [currentBlog, blogs, isAuthenticated]
  // );

  // ============================
  // Like blog
  // ============================
  const toggleLike = useCallback(
    async (blogId) => {
      if (!isAuthenticated) return;

      try {
        // ✅ FIX: Add {} as empty body, and { withCredentials: true } as config
        const res = await api.post(
          API.likes.toggle(blogId), 
          {}, 
          { withCredentials: true }
        );
        
        const { liked, likeCount } = res.data.data;

        if (currentBlog && currentBlog.id === blogId) {
          setCurrentBlog({ ...currentBlog, isLiked: liked, likeCount });
        }

        setBlogs((prev) =>
          prev.map((b) => (b.id === blogId ? { ...b, isLiked: liked, likeCount } : b))
        );

        return res.data;
      } catch (err) {
        setError('Failed to update like');
      }
    },
    [currentBlog, blogs, isAuthenticated]
  );

  // ============================
  // Add comment + Replies
  // ============================
  const addComment = useCallback(
    async (blogId, content, parentId = null) => {
      if (!isAuthenticated) return;

      try {
        const payload = { blogId, content };
        if (parentId) payload.parentCommentId = parentId;

        const res = await api.post(API.comments.create, payload);
        const newComment = res.data.data;

        if (currentBlog && currentBlog.id === blogId) {
          setComments((prev) => [...prev, newComment]);
          setCurrentBlog({
            ...currentBlog,
            commentCount: currentBlog.commentCount + 1,
          });
        }

        return newComment;
      } catch (err) {
        setError('Failed to post comment');
      }
    },
    [currentBlog, isAuthenticated]
  );

// src/context/BlogContext.jsx

  const fetchComments = useCallback(async (blogId) => {
    try {
      // ✅ FIX: Add { withCredentials: true }
      const res = await api.get(API.comments.getByBlog(blogId), {
        withCredentials: true 
      });
      setComments(res.data.data);
    } catch (err) {
      setError('Failed to load comments');
    }
  }, []);

  // ============================
  // Track Read Time
  // ============================
  const trackReadTime = useCallback(
    async (blogId, duration) => {
      if (!isAuthenticated) return;

      try {
        await api.post(API.interactions.track, { blogId, type: 'read', duration });
      } catch (err) {
        console.error('Failed to track read time');
      }
    },
    [isAuthenticated]
  );

  // ============================
  // Like Comment
  // ============================
  const likeComment = async (commentId) => {
    try {
      const res = await api.post(API.comments.like(commentId), {}, { withCredentials: true });
      const { liked, likeCount } = res.data.data;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, isLiked: liked, likeCount };
          }

          const updatedReplies = comment.replies.map((reply) =>
            reply._id === commentId ? { ...reply, isLiked: liked, likeCount } : reply
          );

          return { ...comment, replies: updatedReplies };
        })
      );
    } catch (error) {
      console.log('Like error:', error);
    }
  };

  // ============================
  // Reply
  // ============================
  const replyToComment = useCallback(
    async (blogId, parentId, content) => {
      if (!isAuthenticated) return;
      return addComment(blogId, content, parentId);
    },
    [addComment, isAuthenticated]
  );



  // ============================
// Delete Comment (User only)
// ============================
const deleteComment = async (commentId) => {
  try {
    await api.delete(API.comments.delete(commentId), { withCredentials: true });

    // Update state locally after delete
    setComments((prev) =>
      prev
        .filter((comment) => comment._id !== commentId)
        .map((comment) => {
          const updatedReplies = comment.replies.filter((r) => r._id !== commentId);
          return { ...comment, replies: updatedReplies };
        })
    );

    // Decrease comment count on blog
    if (currentBlog) {
      setCurrentBlog((prev) => ({
        ...prev,
        commentCount: prev.commentCount - 1,
      }));
    }

  } catch (error) {
    console.error("Delete comment error:", error);
  }
};

// 👉 Track Blog View
// inside BlogContext.jsx (inside BlogProvider)

const trackView = async (blogId) => {
  try {
    await api.post("/user/interactions", {
      blogId,
      type: "view"
    });
    console.log("View tracked for blog:", blogId);
  } catch (err) {
    console.error("trackView error:", err.response?.data || err);
  }
};






  // ============================
  // Load on Refresh
  // ============================
  useEffect(() => {
    fetchFeatured();
    fetchNotifications();   // ✅ NEW
  }, [fetchFeatured, fetchNotifications]);

  // ============================
  // PROVIDER VALUES
  // ============================
  return (
    <BlogContext.Provider
      value={{
        blogs,
        featuredBlogs,
        currentBlog,
        comments,
        notifications,      // ✅ NEW
        fetchNotifications, // ✅ NEW
         trackView,
        loading,
        error,
        fetchBlogs,
        fetchBlogBySlug,
        toggleLike,
        addComment,
        fetchComments,
        trackReadTime,
        likeComment,
        replyToComment,
        deleteComment,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error('useBlog must be used within BlogProvider');
  return context;
};
