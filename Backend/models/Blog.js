// models/Blog.js
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      minlength: [20, 'Content should be at least 100 characters'],
    },
    category: { type: String, required: true },
    subcategory: { type: String },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    featuredImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Author (Admin) is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    // Interaction tracking
    viewsCount: { type: Number, default: 0 },
    clicksCount: { type: Number, default: 0 },
    readsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    totalReadTime: { type: Number, default: 0 },
    avgReadTime: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- FIXED SECTION START ---
// Auto-generate slug from title ONLY if slug is missing
BlogSchema.pre('save', function (next) {
  
  // 1. CHECK: If the Controller sent a slug (English), use it!
  if (this.slug && this.slug.length > 0) {
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    return next();
  }

  // 2. FALLBACK: If no slug exists, try to generate one
  if (this.isModified('title')) {
    // Try to make an English slug
    let generatedSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 3. SAFETY NET: If generatedSlug is empty (because title was Tamil), use a Timestamp
    if (!generatedSlug || generatedSlug.length === 0) {
       // Example result: 'post-1715628392' (Unique and clickable)
       this.slug = 'post-' + Date.now(); 
    } else {
       this.slug = generatedSlug;
    }
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});
// --- FIXED SECTION END ---

// Virtual: Calculate avgReadTime
BlogSchema.virtual('averageReadTime').get(function () {
  return this.readsCount > 0 ? Math.round(this.totalReadTime / this.readsCount) : 0;
});

// Indexes
BlogSchema.index({ isPublished: 1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ createdAt: -1 });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);