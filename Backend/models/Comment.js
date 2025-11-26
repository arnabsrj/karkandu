// models/Comment.js
import mongoose from 'mongoose';
// import models from './index';

const CommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: true, // Set to false if you want moderation
    },
    parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment', 
    default: null 
  },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

    // For nested replies
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent comment on deleted/non-published blogs
CommentSchema.pre('save', async function (next) {
  try {
    const blog = await mongoose.model('Blog').findById(this.blog);
    if (!blog || !blog.isPublished || blog.isDeleted) {
      return next(new Error('Cannot comment on unpublished or deleted blog'));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Index for performance
CommentSchema.index({ blog: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ isApproved: 1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);