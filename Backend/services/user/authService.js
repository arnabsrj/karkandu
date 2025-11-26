// services/user/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import logger from '../../utils/logger.js';

const SALT_ROUNDS = 12;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password
export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

// Generate JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Register User
export const registerUser = async ({ name, email, password }) => {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    logger.info(`New user registered: ${email}`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    logger.error('Register error:', error.message);
    throw error;
  }
};

// Login User
export const loginUser = async ({ email, password }) => {
  try {
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    logger.error('Login error:', error.message);
    throw error;
  }
};