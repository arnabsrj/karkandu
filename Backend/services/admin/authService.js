// services/admin/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/index.js';
import logger from '../../utils/logger.js';

const SALT_ROUNDS = 12;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password
const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Register Admin (Only via Postman with secret)
export const registerAdmin = async ({ name, email, password, secret }) => {
  try {
    // Verify secret key
    if (secret !== process.env.ADMIN_REGISTER_SECRET) {
      throw new Error('Invalid admin registration secret');
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken({
      id: admin._id,
      role: admin.role,
    });

    logger.info(`New admin registered via Postman: ${email}`);

    return {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  } catch (error) {
      logger.error('Admin register error:', error.message);
      throw error;
  }
};

// Login Admin
export const loginAdmin = async ({ email, password }) => {
  try {
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      throw new Error('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new Error('Admin account is deactivated');
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      id: admin._id,
      role: admin.role,
    });

    logger.info(`Admin logged in: ${email}`);

    return {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  } catch (error) {
    logger.error('Admin login error:', error.message);
    throw error;
  }
};