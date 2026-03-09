const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order details
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    foodId: Number,
    name: String,
    category: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  
  // Pricing
  subtotal: Number,
  deliveryFee: Number,
  tax: Number,
  discount: Number,
  total: Number,
  
  // Delivery address
  deliveryAddress: {
    street: String,
    city: String,
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Delivery contact
  deliveryName: String,
  deliveryPhone: String,
  
  // Payment info
  paymentMethod: String, // 'card', 'mobile_money', 'cod'
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String,
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  
  // Estimated delivery time (in minutes)
  estimatedDeliveryTime: Number,
  // Absolute estimated delivery timestamp
  estimatedDeliveryAt: Date,
  actualDeliveryTime: Date,
  
  // Delivery stage timestamps
  confirmedAt: Date,
  preparingAt: Date,
  readyAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
  
  // Special instructions
  specialInstructions: String,
  
  // Rating & review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderId = `SC${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
