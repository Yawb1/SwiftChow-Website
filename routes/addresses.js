const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Address = require('../models/Address');

const router = express.Router();

// ============================================
// GET ALL ADDRESSES
// ============================================

router.get('/', requireAuth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// CREATE ADDRESS
// ============================================

router.post('/', requireAuth, async (req, res) => {
  try {
    const { street, city, postalCode, landmark, fullName, phone, label, isDefault, coordinates } = req.body;
    
    if (!street || !fullName || !phone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }
    
    const address = new Address({
      userId: req.user._id,
      street,
      city: city || 'Accra',
      postalCode,
      landmark,
      fullName,
      phone,
      label: label || 'Home',
      isDefault: isDefault || false,
      coordinates: coordinates || {}
    });
    
    await address.save();
    
    res.status(201).json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// UPDATE ADDRESS
// ============================================

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    let address = await Address.findOne({
      _id: id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    
    const { street, city, postalCode, landmark, fullName, phone, label, isDefault, coordinates } = req.body;
    
    if (street) address.street = street;
    if (city) address.city = city;
    if (postalCode) address.postalCode = postalCode;
    if (landmark) address.landmark = landmark;
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (label) address.label = label;
    if (coordinates) address.coordinates = coordinates;
    
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user._id, _id: { $ne: id } },
        { isDefault: false }
      );
      address.isDefault = true;
    }
    
    address.updatedAt = new Date();
    await address.save();
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// DELETE ADDRESS
// ============================================

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// SET DEFAULT ADDRESS
// ============================================

router.put('/:id/default', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Unset all other defaults
    await Address.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );
    
    // Set this as default
    const address = await Address.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
