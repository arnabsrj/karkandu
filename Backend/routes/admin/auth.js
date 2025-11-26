// routes/admin/auth.js
import express from 'express';
import { register, login } from '../../controllers/admin/authController.js';

const router = express.Router();

// @route   POST /api/admin/register
// @desc    Register admin (Postman only with secret)
// @access  Public (but secret-protected)
router.post('/register', register);

// @route   POST /api/admin/login
// @desc    Login admin & return JWT
// @access  Public
router.post('/login', login);

export default router;