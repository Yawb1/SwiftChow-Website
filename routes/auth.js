const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

// Disposable/temporary email domains to reject
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
  'throwaway.email', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.de', 'trashmail.com', 'yopmail.com', 'dispostable.com',
  'maildrop.cc', 'mailnesia.com', 'tempail.com', 'tempr.email'
];

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: { message: 'Please enter a valid email address.', status: 400 } });
    }

    // Reject disposable/temporary email domains
    const emailDomain = email.split('@')[1].toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      return res.status(400).json({ error: { message: 'Please enter a valid email address. Temporary email services are not allowed.', status: 400 } });
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

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    newUser.emailVerificationToken = hashedVerifyToken;
    newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

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

    // Send verification email (non-blocking)
    const verifyUrl = `${process.env.CLIENT_URL || 'https://swiftchow.me'}/api/auth/verify-email?token=${verifyToken}`;
    sendEmail({
      to: newUser.email,
      subject: 'Verify Your Email — SWIFT CHOW',
      html: emailTemplates.emailVerification({ firstName: newUser.firstName, verifyUrl })
    }).catch(err => console.warn('Verification email failed:', err.message));

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
      
      // Send login notification email (non-blocking)
      const loginTime = new Date().toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short',
        timeZone: 'Africa/Accra'
      });
      sendEmail({
        to: user.email,
        subject: 'New Login to Your SwiftChow Account',
        html: emailTemplates.loginNotification({ firstName: user.firstName || 'there', loginTime })
      }).catch(err => console.warn('Login notification email failed:', err.message));

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
  
  // Only pass the token — frontend fetches user data via /api/users/profile
  res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/menu.html?token=${token}`);
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

    await sendEmail({
      to: email,
      subject: 'Password Reset - SWIFT CHOW',
      html: emailTemplates.passwordReset({ firstName: user.firstName, resetUrl: resetLink })
    });

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

    // Send password changed confirmation (non-blocking)
    sendEmail({
      to: user.email,
      subject: 'Password Changed — SWIFT CHOW',
      html: emailTemplates.passwordChanged({ firstName: user.firstName })
    }).catch(err => console.warn('Password changed email failed:', err.message));

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
// EMAIL VERIFICATION
// ============================================

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/login.html?verified=error&msg=missing_token`);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/login.html?verified=error&msg=invalid_token`);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email now that they're verified
    sendEmail({
      to: user.email,
      subject: 'Welcome to SWIFT CHOW!',
      html: emailTemplates.welcome({ firstName: user.firstName })
    }).catch(err => console.warn('Welcome email failed:', err.message));

    res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/login.html?verified=success`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'https://swiftchow.me'}/login.html?verified=error&msg=server_error`);
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required', status: 400 } });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user || user.isEmailVerified) {
      return res.json({ success: true, message: 'If an unverified account with this email exists, a verification link has been sent.' });
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    user.emailVerificationToken = hashedVerifyToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL || 'https://swiftchow.me'}/api/auth/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email — SWIFT CHOW',
      html: emailTemplates.emailVerification({ firstName: user.firstName, verifyUrl })
    });

    return res.json({ success: true, message: 'If an unverified account with this email exists, a verification link has been sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: { message: 'Failed to process request', status: 500 } });
  }
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
