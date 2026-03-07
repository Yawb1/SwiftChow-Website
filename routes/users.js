const express = require('express');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// ============================================
// GET USER PROFILE
// ============================================

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('addresses')
      .populate('savedPaymentMethods');
    
    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone, dob, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================

router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ error: 'Account uses social login. Password cannot be changed here.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword; // pre-save hook will hash it
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UPDATE USER PREFERENCES
// ============================================

router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const { darkMode, newsletter } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (typeof darkMode !== 'undefined') user.darkMode = darkMode;
    if (typeof newsletter !== 'undefined') user.newsletter = newsletter;
    
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FAVORITE ITEMS
// ============================================

router.post('/favorites/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user.favoriteItems.includes(parseInt(itemId))) {
      user.favoriteItems.push(parseInt(itemId));
      await user.save();
    }
    
    res.json({
      success: true,
      favoriteItems: user.favoriteItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/favorites/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.favoriteItems = user.favoriteItems.filter(id => id !== parseInt(itemId));
    await user.save();
    
    res.json({
      success: true,
      favoriteItems: user.favoriteItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET USER STATS
// ============================================

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      stats: {
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
