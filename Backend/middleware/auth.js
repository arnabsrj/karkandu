// middleware/auth.js
import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../utils/constants.js';
import { User } from '../models/index.js';
import Admin from '../models/Admin.js';

// Helper: Verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Main Auth Middleware
const auth = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.token || req.header('x-auth-token');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token, authorization denied',
        });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid',
        });
      }

      // Attach user/admin to request
      let user = null;
      if (decoded.role === USER_ROLES.USER && decoded.id) {
        user = await User.findById(decoded.id).select('-password');
      } else if (decoded.role === USER_ROLES.ADMIN && decoded.id) {
        user = await Admin.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated',
        });
      }

      // Role check
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
      });
    }
  };
};

/**
 * ✅ NEW: Optional Auth Middleware
 * Checks for token. If found & valid, attaches user.
 * If missing or invalid, simply calls next() (treats as Guest).
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('x-auth-token');

    // If no token, proceed as Guest (req.user remains undefined)
    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(); // Invalid token? Proceed as Guest.
    }

    // Try to find the user
    let user = null;
    if (decoded.role === USER_ROLES.USER && decoded.id) {
      user = await User.findById(decoded.id).select('-password');
    } else if (decoded.role === USER_ROLES.ADMIN && decoded.id) {
      user = await Admin.findById(decoded.id).select('-password');
    }

    // If user found and active, attach to request
    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // On any error, just proceed as guest
    next();
  }
};



// Export variants
export const protect = auth();                    // Any logged-in user
export const protectUser = auth(USER_ROLES.USER); // Only users
export const protectAdmin = auth(USER_ROLES.ADMIN); // Only admins

export default auth;

// // Export variants
// export const protect = auth();                    // Any logged-in user
// export const protectUser = auth(USER_ROLES.USER); // Only users
// export const protectAdmin = auth(USER_ROLES.ADMIN); // Only admins

// export default auth;