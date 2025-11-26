// controllers/admin/userController.js

import User from '../../models/User.js'; // ← ADD THIS
import bcrypt from 'bcryptjs';

import { 
  getAllUsers, 
  getLoginLogs, 
  toggleUserStatus 
} from '../../services/admin/userService.js';
import logger from '../../utils/logger.js';

/**
 * @desc    Get all users (admin panel)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getUsers = async (req, res) => {
  try {
    const { search, role, isActive, page = 1, limit = 10 } = req.query;

    const filters = {
      search: search || '',
      role: role || undefined,
      isActive: isActive || undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await getAllUsers(filters);

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get users controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * @desc    Get login logs
 * @route   GET /api/admin/users/logs
 * @access  Private (Admin)
 */
export const getLogs = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    const filters = {
      userId: userId || undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await getLoginLogs(filters);

    res.status(200).json({
      success: true,
      message: 'Login logs fetched successfully',
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get login logs controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch login logs',
    });
  }
};

/**
 * @desc    Toggle user active status (ban/unban)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin)
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await toggleUserStatus(id);

    res.status(200).json({
      success: true,
      message: `User ${result.isActive ? 'activated' : 'deactivated'}`,
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    logger.error('Toggle user status controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
};



/**
 * @desc    Delete a user permanently
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Optional: Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself',
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.id} deleted user ${id}`);

    res.status(200).json({
      success: true,
      message: 'User deleted permanently',
    });
  } catch (error) {
    logger.error('Delete user controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};





// ADMIN ONLY: Create a new devotee (user)
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A devotee with this email already exists'
      });
    }

    const finalPassword = password || 'tamilsage108';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      isApproved: true,
      createdBy: req.user.id // optional: track who created
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'New devotee granted access by Guru',
      data: {
        name: user.name,
        email: user.email,
        temporaryPassword: finalPassword, // so admin can send it
        userId: user._id
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user. Please try again.'
    });
  }
};


