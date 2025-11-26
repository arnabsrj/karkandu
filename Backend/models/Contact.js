// backend/models/Contact.js
import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    default: null
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);