const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
// FACEBOOK OAUTH CALLBACK
// ============================================

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_auth_failed' }), (req, res) => {
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
// FACEBOOK OAUTH ROUTE
// ============================================

router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

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
