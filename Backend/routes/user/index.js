// routes/user/index.js
import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../../controllers/user/authController.js';
import { getProfile, updateProfile } from '../../controllers/user/profileController.js';
import { createComment, deleteComment, getComments, likeComment, replyToComment } from '../../controllers/user/commentController.js';
import { toggleBlogLike, getBlogLikeStatus } from '../../controllers/user/likeController.js';
import { getBlogs, getBlog, getFeatured } from '../../controllers/user/blogController.js';
import { track } from '../../controllers/user/interactionController.js';
import { protect, optionalAuth } from '../../middleware/auth.js';
import { getNotifications, markAllAsRead } from '../../controllers/user/notificationController.js';
import { create } from '../../controllers/user/contactController.js';
import { subscribe } from '../../controllers/user/subscriberController.js';

const router = express.Router();

// Auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
// ✅ NEW: Route for updating profile
router.put('/profile', protect, updateProfile);
// routes/user.js or auth.js
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out' });
});

// ADD THESE TWO ROUTES – put them with the other auth routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);  // We'll use this later too


// 2. ADD THIS NEW ROUTE
router.post('/subscribe', subscribe);


// Blogs (Public)
router.get('/blogs', getBlogs);
router.get('/blogs/featured', getFeatured);
router.get('/blogs/:slug', getBlog);

// Comments
router.post('/comments', protect, createComment);
router.get('/comments/:blogId', optionalAuth, getComments);
router.post('/comments/:commentId/reply', protect, replyToComment);
router.post('/comments/:commentId/like', protect, likeComment);
router.delete('/comments/:commentId', protect, deleteComment);



//notificatio route
// Notification routes
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllAsRead);

// Likes
router.post('/likes/:blogId', protect, toggleBlogLike);
router.get('/likes/:blogId/status', optionalAuth, getBlogLikeStatus);

// Interactions
router.post('/interactions', optionalAuth, track); // Public (guest OK)


//contact
router.post('/contact', create);


export default router;