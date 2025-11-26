import Contact from '../../models/Contact.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/admin/contacts
 * @access  Private (Admin)
 */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    // Check if req.user exists (it might be missing if auth middleware failed earlier)
    const adminName = req.user ? req.user.name : 'Admin';
    logger.info(`Admin ${adminName} viewed contact messages`);

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    logger.error('Get all contacts error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact messages'
    });
  }
};

/**
 * @desc    Delete a contact message
 * @route   DELETE /api/admin/contacts/:id
 * @access  Private (Admin)
 */
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    const adminName = req.user ? req.user.name : 'Admin';
    logger.info(`Admin ${adminName} deleted contact message ${req.params.id}`);

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (err) {
    logger.error('Delete contact error:', err.message);
    // Handle invalid ID format specifically
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact message'
    });
  }
};