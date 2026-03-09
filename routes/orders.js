const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

const router = express.Router();

// ============================================
// CREATE ORDER
// ============================================

router.post('/create', requireAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }
    
    if (!deliveryAddress) {
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 5; // Fixed delivery fee
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;
    
    // Generate orderId
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `SC${timestamp}${random}`;
    
    // Calculate estimated delivery timestamp
    const estimatedMinutes = 30;
    const now = new Date();
    const estimatedDeliveryAt = new Date(now.getTime() + estimatedMinutes * 60000);
    
    // Create order
    const order = new Order({
      orderId, // Set the orderId explicitly
      userId: req.user._id,
      items,
      deliveryAddress,
      deliveryName: (req.user.firstName || '') + ' ' + (req.user.lastName || ''),
      deliveryPhone: req.user.phone || '',
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      deliveryFee,
      tax,
      total,
      specialInstructions,
      estimatedDeliveryTime: estimatedMinutes,
      estimatedDeliveryAt,
      confirmedAt: now,
      statusHistory: [{
        status: 'confirmed',
        timestamp: now,
        note: 'Order placed'
      }],
      status: 'confirmed'
    });
    
    await order.save();
    
    // Update user stats (safely)
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.totalOrders = (user.totalOrders || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + total;
        await user.save();
      }
    } catch (userError) {
      console.warn('Warning: Could not update user stats:', userError.message);
    }
    
    // Send order confirmation email (non-blocking)
    try {
      const customerName = (req.user.firstName || req.user.fullName || '').split(' ')[0] || 'Customer';
      const customerEmail = req.user.email;
      if (customerEmail && typeof emailTemplates.orderConfirmation === 'function') {
        const html = emailTemplates.orderConfirmation({
          firstName: customerName,
          orderId: order.orderId,
          items: order.items,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          estimatedDeliveryTime: estimatedMinutes,
          estimatedDeliveryAt: estimatedDeliveryAt,
          trackingUrl: (process.env.CLIENT_URL || 'https://swiftchow.me') + '/tracking.html?order=' + order.orderId
        });
        sendEmail({ to: customerEmail, subject: 'Your SwiftChow order has been received!', html }).catch(() => {});
      }
    } catch (emailErr) {
      console.warn('Warning: Could not send order confirmation email:', emailErr.message);
    }
    
    res.status(201).json({
      success: true,
      order,
      orderId: order.orderId
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create order. Please try again.' });
  }
});

// ============================================
// GET USER ORDERS
// ============================================

router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// GET LATEST ORDER
// ============================================

router.get('/latest', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'No orders found' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// GET ORDER BY ID
// ============================================

router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      userId: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// UPDATE ORDER STATUS
// Only the order owner can cancel; forward-only status transitions enforced.
// ============================================

router.put('/:orderId/status', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      userId: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Customers can only cancel orders (not advance status through delivery stages)
    // Status advancement beyond 'confirmed' requires admin/system action
    const customerAllowed = ['cancelled'];
    if (!customerAllowed.includes(status)) {
      // Only allow if order is still pending and moving to confirmed (e.g. payment callback)
      if (!(order.status === 'pending' && status === 'confirmed')) {
        return res.status(403).json({ success: false, error: 'You do not have permission to update the order status. Contact support if there is an issue.' });
      }
    }
    
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || ''
    });
    
    // Set stage timestamps
    const now = new Date();
    if (status === 'confirmed' && !order.confirmedAt) order.confirmedAt = now;
    if (status === 'preparing' && !order.preparingAt) order.preparingAt = now;
    if (status === 'ready' && !order.readyAt) order.readyAt = now;
    if (status === 'out_for_delivery' && !order.outForDeliveryAt) order.outForDeliveryAt = now;
    if (status === 'delivered') {
      if (!order.deliveredAt) order.deliveredAt = now;
      order.actualDeliveryTime = now;
      
      // Send delivery completion email (non-blocking)
      try {
        const user = await User.findById(order.userId);
        if (user && user.email && typeof emailTemplates.deliveryConfirmation === 'function') {
          const customerName = (user.firstName || user.fullName || '').split(' ')[0] || 'Customer';
          const html = emailTemplates.deliveryConfirmation({
            firstName: customerName,
            orderId: order.orderId
          });
          sendEmail({ to: user.email, subject: 'Your SwiftChow order has been delivered!', html }).catch(() => {});
        }
      } catch (emailErr) {
        console.warn('Warning: Could not send delivery email:', emailErr.message);
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// RATE ORDER
// ============================================

router.post('/:orderId/rate', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    
    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      userId: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    order.rating = rating;
    order.review = review || '';
    order.reviewedAt = new Date();
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// CANCEL ORDER
// ============================================

router.post('/:orderId/cancel', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      userId: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel this order' });
    }
    
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by user'
    });
    
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
