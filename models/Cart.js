const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  foodId: { type: Number, required: true },
  name: { type: String, default: '' },
  category: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
