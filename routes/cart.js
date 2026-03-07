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
    res.status(500).json({ error: error.message });
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

    let doc = await Cart.findOne({ userId: req.user._id });

    if (!doc) {
      doc = new Cart({ userId: req.user._id, items: [] });
    }

    const existing = doc.items.find(i => i.foodId === Number(foodId));

    if (existing) {
      existing.quantity += Number(quantity) || 1;
    } else {
      doc.items.push({ foodId: Number(foodId), name, category, price: Number(price), image, quantity: Number(quantity) || 1 });
    }

    await doc.save();

    res.json({
      success: true,
      cart: doc.items.map(i => ({ id: i.foodId, foodId: i.foodId, name: i.name, category: i.category, price: i.price, image: i.image, quantity: i.quantity })),
      total: cartTotal(doc.items)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
