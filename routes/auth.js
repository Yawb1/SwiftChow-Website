const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

// ============================================
// REGISTER ENDPOINT
// ============================================

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: { message: 'Missing required fields', status: 400 } });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters long', status: 400 } });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one letter', status: 400 } });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one number', status: 400 } });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one symbol (!@#$%^&* etc.)', status: 400 } });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: { message: 'Email already registered', status: 409 } });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone
      },
      token: token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: { message: 'Registration failed', status: 500 } });
  }
});

// ============================================
// LOGIN ENDPOINT (FIXED)
// ============================================

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Auth error:', err);
      return res.status(500).json({ error: { message: 'Authentication error', status: 500 } });
    }
    
    if (!user) {
      console.log('No user found:', info);
      return res.status(401).json({ error: { message: info?.message || 'Invalid credentials', status: 401 } });
    }
    
    // Log the user in via passport session
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: { message: 'Login failed', status: 500 } });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      console.log('Login successful for:', user.email, 'Token:', token.substring(0, 20) + '...');
      
      // Return user data and token
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage
        },
        token: token
      });
    });
  })(req, res, next);
});

// ============================================
// GOOGLE OAUTH CALLBACK
// ============================================

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }), (req, res) => {
  const token = jwt.sign(
    { userId: req.user._id, email: req.user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/menu.html?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

// ============================================
// GOOGLE OAUTH ROUTE
// ============================================

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ============================================
// FORGOT PASSWORD
// ============================================

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required', status: 400 } });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL || 'https://swiftchow.me'}/reset-password.html?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>Hi ${user.firstName},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <p style="margin-top: 30px; text-align: center;">
            <a href="${resetLink}" style="background: #DC2626; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">Reset Password</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            If you did not request a password reset, please ignore this email.
          </p>
          <p style="font-size: 12px; color: #666;">
            This link will expire in 1 hour.
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>&copy; 2026 SWIFT CHOW. All rights reserved. | orders@swiftchow.me</p>
        </div>
      </div>
    `;

    await sendEmail({ to: email, subject: 'Password Reset - SWIFT CHOW', html });

    return res.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: { message: 'Failed to process request', status: 500 } });
  }
});

// ============================================
// RESET PASSWORD
// ============================================

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: { message: 'Token and new password are required', status: 400 } });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters long', status: 400 } });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one letter', status: 400 } });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one number', status: 400 } });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      return res.status(400).json({ error: { message: 'Password must contain at least one symbol (!@#$%^&* etc.)', status: 400 } });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid or expired reset token', status: 400 } });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: { message: 'Failed to reset password', status: 500 } });
  }
});

// ============================================
// LOGOUT
// ============================================

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: { message: 'Logout failed', status: 500 } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// ============================================
// CHECK AUTH STATUS
// ============================================

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
  }
  
  res.json({
    success: true,
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      profileImage: req.user.profileImage
    }
  });
});

module.exports = router;
