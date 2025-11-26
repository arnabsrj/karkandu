// controllers/admin/authController.js
import Admin from '../../models/Admin.js';
import { registerAdmin, loginAdmin } from '../../services/admin/authService.js';
import logger from '../../utils/logger.js';
import { translate } from '@vitalets/google-translate-api'; // Import this

export const register = async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    if (!name || !email || !password || !secret) {
       // handle error
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // --- TRANSLATE ADMIN NAME ---
    let tamilName = name;
    try {
      const res = await translate(name, { to: 'ta' });
      tamilName = res.text;
    } catch (e) {
      console.log("Admin name translation failed");
    }

    // Pass translated name
    const result = await registerAdmin({ name: tamilName, email, password, secret });

    const { token, admin } = result;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin.id,
          name: admin.name, // Will be Tamil
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    const statusCode = 
      error.message.includes('secret') || 
      error.message.includes('already exists') 
        ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Admin registration failed',
    });
  }
};

// ... Keep login and getProfile the same as before ...
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const result = await loginAdmin({ email, password });
    const { token, admin } = result;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        }
      },
    });
  } catch (error) {
    const statusCode = error.message === 'Invalid credentials' ? 401 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};