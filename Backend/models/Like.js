// models/Like.js
import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema(
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
    // Optional: Allow like type (e.g., heart, wisdom, light)
    type: {
      type: String,
      enum: ['heart', 'wisdom', 'light'],
      default: 'heart',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure one like per user per blog (unique compound index)
LikeSchema.index({ blog: 1, user: 1 }, { unique: true });

// Auto-populate blog & user on find
LikeSchema.pre(/^find/, function (next) {
  this.populate([
    { path: 'blog', select: 'title slug featuredImage' },
    { path: 'user', select: 'name avatar' },
  ]);
  next();
});

// On save: Update blog's like count (we'll use aggregation later)
// LikeSchema.post('save', async function () {
//   await mongoose.model('Blog').updateOne(
//     { _id: this.blog },
//     { $inc: { likesCount: 1 } }
//   );
// });

// // On remove: Decrement like count
// LikeSchema.post('remove', async function () {
//   await mongoose.model('Blog').updateOne(
//     { _id: this.blog },
//     { $inc: { likesCount: -1 } }
//   );
// });

export default mongoose.models.Like || mongoose.model('Like', LikeSchema);