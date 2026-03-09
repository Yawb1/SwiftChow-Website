const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Cart = require('../models/Cart');

const router = express.Router();

// Helper: compute cart total
function cartTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ============================================
// GET CART
// ============================================

router.get('/', requireAuth, async (req, res) => {
  try {
    const doc = await Cart.findOne({ userId: req.user._id });
    const items = doc ? doc.items : [];

    res.json({
      success: true,
      cart: items.map(i => ({ id: i.foodId, foodId: i.foodId, name: i.name, category: i.category, price: i.price, image: i.image, quantity: i.quantity })),
      total: cartTotal(items)
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// ADD TO CART
// ============================================

router.post('/add', requireAuth, async (req, res) => {
  try {
    const { foodId, name, category, price, image, quantity = 1 } = req.body;

    if (!foodId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate quantity limits
    const qty = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));
    const itemPrice = Math.max(0, Number(price));

    if (isNaN(Number(foodId)) || itemPrice <= 0) {
      return res.status(400).json({ error: 'Invalid item data' });
    }

    let doc = await Cart.findOne({ userId: req.user._id });

    if (!doc) {
      doc = new Cart({ userId: req.user._id, items: [] });
    }

    // Limit total items in cart to prevent abuse
    if (doc.items.length >= 50) {
      return res.status(400).json({ error: 'Cart item limit reached (50 items max)' });
    }

    const existing = doc.items.find(i => i.foodId === Number(foodId));

    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + qty);
    } else {
      doc.items.push({ foodId: Number(foodId), name: String(name || '').slice(0, 200), category: String(category || '').slice(0, 50), price: itemPrice, image: String(image || '').slice(0, 500), quantity: qty });
    }

    await doc.save();

    res.json({
      success: true,
      cart: doc.items.map(i => ({ id: i.foodId, foodId: i.foodId, name: i.name, category: i.category, price: i.price, image: i.image, quantity: i.quantity })),
      total: cartTotal(doc.items)
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// UPDATE CART ITEM
// ============================================

router.put('/update', requireAuth, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || quantity == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = await Cart.findOne({ userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (quantity <= 0) {
      doc.items = doc.items.filter(i => i.foodId !== Number(foodId));
    } else {
      const item = doc.items.find(i => i.foodId === Number(foodId));
      if (!item) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      item.quantity = Number(quantity);
    }

    await doc.save();

    res.json({
      success: true,
      cart: doc.items.map(i => ({ id: i.foodId, foodId: i.foodId, name: i.name, category: i.category, price: i.price, image: i.image, quantity: i.quantity })),
      total: cartTotal(doc.items)
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// REMOVE FROM CART
// ============================================

router.delete('/remove/:foodId', requireAuth, async (req, res) => {
  try {
    const foodId = Number(req.params.foodId);

    const doc = await Cart.findOne({ userId: req.user._id });
    if (!doc) {
      return res.json({ success: true, cart: [], total: 0 });
    }

    doc.items = doc.items.filter(i => i.foodId !== foodId);
    await doc.save();

    res.json({
      success: true,
      cart: doc.items.map(i => ({ id: i.foodId, foodId: i.foodId, name: i.name, category: i.category, price: i.price, image: i.image, quantity: i.quantity })),
      total: cartTotal(doc.items)
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// ============================================
// CLEAR CART
// ============================================

router.delete('/clear', requireAuth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.json({
      success: true,
      cart: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
