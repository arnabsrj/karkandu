// backend/controllers/user/contactController.js
import Contact from '../../models/Contact.js';  // ← MUST BE EXACTLY THIS PATH
import logger from '../../utils/logger.js';

export const create = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required'
      });
    }

    const contact = new Contact({ name, email, mobile, message });
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);  // ← This will show exact error
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};