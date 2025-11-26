// models/LoginLog.js
import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    ip: {
      type: String,
      trim: true,
      required: [true, 'IP address is required'],
    },
    userAgent: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    city: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    device: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for admin dashboard queries
LoginLogSchema.index({ user: 1, loginAt: -1 });
LoginLogSchema.index({ ip: 1 });
LoginLogSchema.index({ country: 1 });
LoginLogSchema.index({ success: 1 });

// Auto-populate user info
LoginLogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email avatar',
  });
  next();
});

export default mongoose.models.LoginLog || mongoose.model('LoginLog', LoginLogSchema);