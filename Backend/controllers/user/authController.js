// controllers/user/authController.js
import { registerUser, loginUser } from '../../services/user/authService.js';
import logger from '../../utils/logger.js';
import User from '../../models/User.js';
import crypto from 'crypto';
import sendEmail from '../../config/sendEmail.js';

// --- NEW: Import Translation ---
import { translate } from '@vitalets/google-translate-api';

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // --- 1. TRANSLATE NAME TO TAMIL ---
    let tamilName = name;
    try {
      const res = await translate(name, { to: 'ta' });
      tamilName = res.text; // "John" becomes "ஜான்"
    } catch (err) {
      console.error("Name Translation Failed:", err.message);
      // If translation fails, we keep the English name as fallback
    }

    // --- 2. SAVE USER WITH TAMIL NAME ---
    // We pass 'tamilName' instead of 'name'
    const result = await registerUser({ name: tamilName, email, password });
    const { token, user } = result;

    // ✅ Send Welcome Email (Using Tamil Name)
    try {
      const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>வணக்கம் (Welcome), ${user.name}!</h1>
        <p>We are thrilled to have you join our Tamil Wisdom community.</p>
        <p>You have successfully registered with: <strong>${user.email}</strong></p>
        <br/>
        <p>Explore our blogs and start your journey.</p>
        <p>Best Regards,<br/>The Team</p>
      </div>
    `;

      await sendEmail({
        sendTo: user.email,
        subject: "Welcome to Tamil Wisdom!",
        html: welcomeHtml
      });
      console.log("✅ Email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("⚠️ Email failed to send:", emailError.message);
    }

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name, // This will now be in Tamil
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    const statusCode = error.message.includes('already exists') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await loginUser({ email, password });
    const { token, user } = result;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name, // Returns Tamil name from DB
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    const statusCode = error.message === 'Invalid credentials' ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// Get Current User
export const getMe = async (req, res) => {
  try {
    const user = await req.user
      .populate('likedBlogs', 'title slug featuredImage excerpt') 
      .populate('commentedBlogs', 'title slug');

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio || '',
        likedBlogs: user.likedBlogs,
        commentedBlogs: user.commentedBlogs,
      },
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide an email address" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const messageHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #d32f2f;">Password Reset Request</h2>
        <p>Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">(Link expires in 10 minutes)</p>
      </div>
    `;

    await sendEmail({
      sendTo: user.email,
      subject: "Password Reset Request",
      html: messageHtml
    });

    res.status(200).json({ success: true, message: "Reset link sent to email" });

  } catch (error) {
    console.error("Forgot password error:", error);
    const user = await User.findOne({ email: req.body.email });
    if(user){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: "Email could not be sent", error: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("🔹 1. Reset Request Received");
    console.log("🔹 Received Token from URL:", token);

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash the URL token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log("🔹 Generated Hash:", hashedToken);

    // Attempt to find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      // DEBUGGING: If not found, let's see WHY (Invalid Token OR Expired)
      const rawUser = await User.findOne({ resetPasswordToken: hashedToken });
      if (!rawUser) {
        console.log("❌ Error: Token hash does not match any user in DB.");
      } else {
        console.log("❌ Error: Token found but it has EXPIRED.");
      }

      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    console.log("✅ User found:", user.email);

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Password updated successfully");

    res.status(200).json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};