// controllers/user/profileController.js
import { getUserProfile } from '../../services/user/profileService.js';
import logger from '../../utils/logger.js';
import User from '../../models/User.js';

/**
 * @desc    Get current user's profile
 * @route   GET /api/user/profile
 * @access  Private (User)
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    console.log('Fetching profile for:', userId);
const profile = await getUserProfile(userId);
console.log('Profile fetched ✅');
    // const profile = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    });
  } catch (error) {
    const statusCode = error.message === 'User not found' ? 404 : 500;
    logger.error('Profile controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // 1. Get user ID from the protected request
    const userId = req.user._id;
    const { name, bio } = req.body;

    // 2. Find and Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio },
      { new: true, runValidators: true } // Return the new updated user
    ).select('-password'); 

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};