// backend/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_blog', 'comment_like', 'comment_reply'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedBlog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);