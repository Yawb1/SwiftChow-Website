const express = require('express');
const { requireAuth } = require('../middleware/auth');
const PaymentMethod = require('../models/PaymentMethod');

const router = express.Router();

// ============================================
// GET ALL PAYMENT METHODS
// ============================================

router.get('/', requireAuth, async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ userId: req.user._id });
    
    res.json({
      success: true,
      methods
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// ADD PAYMENT METHOD
// ============================================

router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, cardNumber, cardHolder, expiryMonth, expiryYear, mobileNumber, provider, label, isDefault } = req.body;
    
    if (!type) {
      return res.status(400).json({ success: false, error: 'Payment type is required' });
    }

    // Validate card fields
    if (type === 'credit_card' || type === 'debit_card') {
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
        return res.status(400).json({ success: false, error: 'Invalid card number' });
      }
      if (expiryMonth < 1 || expiryMonth > 12) {
        return res.status(400).json({ success: false, error: 'Invalid expiry month' });
      }
      const currentYear = new Date().getFullYear();
      if (!expiryYear || expiryYear < currentYear || expiryYear > currentYear + 20) {
        return res.status(400).json({ success: false, error: 'Invalid expiry year' });
      }
    }

    // Validate mobile money fields
    if (type === 'mobile_money') {
      if (!mobileNumber || !provider) {
        return res.status(400).json({ success: false, error: 'Mobile number and provider are required' });
      }
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }
    
    const method = new PaymentMethod({
      userId: req.user._id,
      type,
      cardLast4: cardNumber ? cardNumber.slice(-4) : undefined,
      cardHolder: cardHolder ? String(cardHolder).slice(0, 100) : undefined,
      expiryMonth,
      expiryYear,
      mobileNumber,
      provider,
      label: label ? String(label).slice(0, 50) : 'Card',
      isDefault: isDefault || false,
      isVerified: true
    });
    
    await method.save();
    
    res.status(201).json({
      success: true,
      method: method.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// UPDATE PAYMENT METHOD
// ============================================

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, isDefault } = req.body;
    
    let method = await PaymentMethod.findOne({
      _id: id,
      userId: req.user._id
    });
    
    if (!method) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }
    
    if (label) method.label = label;
    
    if (isDefault && !method.isDefault) {
      await PaymentMethod.updateMany(
        { userId: req.user._id, _id: { $ne: id } },
        { isDefault: false }
      );
      method.isDefault = true;
    }
    
    method.updatedAt = new Date();
    await method.save();
    
    res.json({
      success: true,
      method: method.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// DELETE PAYMENT METHOD
// ============================================

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const method = await PaymentMethod.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!method) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }
    
    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// SET DEFAULT PAYMENT METHOD
// ============================================

router.put('/:id/default', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Unset all other defaults
    await PaymentMethod.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );
    
    // Set this as default
    const method = await PaymentMethod.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!method) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }
    
    res.json({
      success: true,
      method: method.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
