const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
const { requireAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

const router = express.Router();

// Initialize Flutterwave with env vars (never hardcoded)
function getFlw() {
  const pubKey = process.env.FLW_PUBLIC_KEY;
  const secKey = process.env.FLW_SECRET_KEY;
  if (!pubKey || !secKey) {
    throw new Error('Flutterwave API keys not configured');
  }
  return new Flutterwave(pubKey, secKey);
}

// ============================================
// GET PUBLIC KEY (safe to expose)
// ============================================
router.get('/public-key', (req, res) => {
  const pubKey = process.env.FLW_PUBLIC_KEY;
  if (!pubKey) {
    return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
  }
  res.json({ publicKey: pubKey });
});

// ============================================
// INITIALIZE PAYMENT â€” create pending order + return payment data
// ============================================
router.post('/initialize', requireAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions, deliveryFee: clientDeliveryFee } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }

    // Calculate totals server-side (never trust client totals)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = typeof clientDeliveryFee === 'number' && clientDeliveryFee >= 0
      ? clientDeliveryFee
      : (subtotal > 100 ? 0 : 15);
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;

    // Generate orderId
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `SC${timestamp}${random}`;

    // Create order with pending payment status
    const estimatedMinutes = 30;
    const order = new Order({
      orderId,
      userId: req.user._id,
      items,
      deliveryAddress,
      deliveryName: (req.user.firstName || '') + ' ' + (req.user.lastName || ''),
      deliveryPhone: req.user.phone || '',
      paymentMethod: paymentMethod || 'card',
      subtotal,
      deliveryFee,
      tax,
      total,
      specialInstructions,
      estimatedDeliveryTime: estimatedMinutes,
      estimatedDeliveryAt: new Date(Date.now() + estimatedMinutes * 60000),
      paymentStatus: 'pending',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created â€” awaiting payment'
      }]
    });

    await order.save();

    // Unique transaction reference
    const txRef = `SWCHOW-${orderId}-${Date.now()}`;

    // Return data for Flutterwave inline checkout
    res.json({
      success: true,
      orderId: order.orderId,
      orderDbId: order._id,
      payment: {
        tx_ref: txRef,
        amount: total,
        currency: 'GHS',
        customer: {
          email: req.user.email,
          name: (req.user.firstName || '') + ' ' + (req.user.lastName || ''),
          phone_number: req.user.phone || ''
        },
        meta: {
          orderId: order.orderId,
          userId: req.user._id.toString()
        },
        customizations: {
          title: 'SWIFT CHOW',
          description: `Order ${orderId}`,
          logo: 'https://swiftchow.me/logo.png'
        }
      }
    });
  } catch (error) {
    console.error('Error initializing payment:', error.message);
    res.status(500).json({ success: false, error: 'Failed to initialize payment' });
  }
});

// ============================================
// VERIFY PAYMENT â€” server-side verification
// ============================================
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { transaction_id, orderId } = req.body;

    if (!transaction_id || !orderId) {
      return res.status(400).json({ success: false, error: 'Transaction ID and Order ID are required' });
    }

    // Find the order
    const order = await Order.findOne({
      $or: [{ orderId }, { _id: orderId }],
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Prevent double-verification
    if (order.paymentStatus === 'completed') {
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    // Verify with Flutterwave server-side (NEVER trust frontend alone)
    const flw = getFlw();
    const response = await flw.Transaction.verify({ id: transaction_id });

    if (
      response.data &&
      response.data.status === 'successful' &&
      response.data.currency === 'GHS' &&
      Math.abs(response.data.amount - order.total) < 1
    ) {
      // Payment verified â€” update order
      order.paymentStatus = 'completed';
      order.transactionId = String(transaction_id);
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: `Payment verified (Flutterwave #${transaction_id})`
      });

      await order.save();

      // Send order confirmation email (non-blocking)
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          // Update user stats
          user.totalOrders = (user.totalOrders || 0) + 1;
          user.totalSpent = (user.totalSpent || 0) + order.total;
          await user.save();

          const CLIENT_URL = process.env.CLIENT_URL || 'https://swiftchow.me';
          const emailHtml = emailTemplates.orderConfirmation({
            firstName: user.firstName || 'Customer',
            orderId: order.orderId,
            items: order.items,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.total,
            estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
            estimatedDeliveryAt: order.estimatedDeliveryAt,
            trackingUrl: `${CLIENT_URL}/tracking?id=${order.orderId}`
          });
          sendEmail({
            to: user.email,
            subject: `Order Confirmed - ${order.orderId}`,
            html: emailHtml
          }).catch(() => {});
        }
      } catch (userErr) {
        console.warn('Could not update user stats or send email:', userErr.message);
      }

      return res.json({
        success: true,
        message: 'Payment verified',
        order
      });
    } else {
      // Payment failed or amount mismatch
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: 'pending',
        timestamp: new Date(),
        note: 'Payment verification failed'
      });
      await order.save();

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        details: response.data ? response.data.status : 'unknown'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// ============================================
// WEBHOOK â€” Flutterwave server-to-server notification
// ============================================
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature
    const secretHash = process.env.FLW_WEBHOOK_SECRET;
    const signature = req.headers['verif-hash'];

    if (!secretHash || signature !== secretHash) {
      return res.status(401).json({ success: false, error: 'Unauthorized webhook' });
    }

    const payload = req.body;

    if (payload.event === 'charge.completed' && payload.data && payload.data.status === 'successful') {
      const txRef = payload.data.tx_ref;
      // Extract orderId from tx_ref format: SWCHOW-{orderId}-{timestamp}
      const parts = txRef.split('-');
      const orderId = parts.length >= 2 ? parts[1] : null;

      if (orderId) {
        const order = await Order.findOne({ orderId });
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'completed';
          order.transactionId = String(payload.data.id);
          order.status = 'confirmed';
          order.confirmedAt = new Date();
          order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            note: `Webhook: Payment confirmed (Flutterwave #${payload.data.id})`
          });
          await order.save();

          // Send confirmation email (non-blocking)
          try {
            const user = await User.findById(order.userId);
            if (user) {
              const CLIENT_URL = process.env.CLIENT_URL || 'https://swiftchow.me';
              const emailHtml = emailTemplates.orderConfirmation({
                firstName: user.firstName || 'Customer',
                orderId: order.orderId,
                items: order.items,
                subtotal: order.subtotal,
                deliveryFee: order.deliveryFee,
                total: order.total,
                estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
                estimatedDeliveryAt: order.estimatedDeliveryAt,
                trackingUrl: `${CLIENT_URL}/tracking?id=${order.orderId}`
              });
              sendEmail({
                to: user.email,
                subject: `Order Confirmed - ${order.orderId}`,
                html: emailHtml
              }).catch(() => {});
            }
          } catch (emailErr) {
            // Non-critical, don't block webhook response
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(200).json({ status: 'ok' });
  }
});

module.exports = router;
