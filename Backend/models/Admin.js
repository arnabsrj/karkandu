// models/Admin.js
import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.js';

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password
    },
    role: {
      type: String,
      enum: [USER_ROLES.ADMIN],
      default: USER_ROLES.ADMIN,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredVia: {
      type: String,
      default: 'postman',
      enum: ['postman'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only admins can be created via Postman (enforced in controller)
// AdminSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);