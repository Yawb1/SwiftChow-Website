const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment method type
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'mobile_money'],
    required: true
  },
  
  // Card details — only last 4 digits stored (PCI DSS compliant)
  cardLast4: {
    type: String,
    trim: true,
    maxlength: 4
  },
  cardHolder: {
    type: String,
    trim: true,
    maxlength: 100
  },
  expiryMonth: {
    type: Number,
    min: 1,
    max: 12
  },
  expiryYear: {
    type: Number,
    min: 2024,
    max: 2099
  }
  // NOTE: CVV must NEVER be stored (PCI DSS). Card tokenization via Flutterwave is used for payments.
  
  // Mobile money details
  mobileNumber: String,
  provider: {
    type: String,
    enum: ['MTN', 'Vodafone', 'AirtelTigo']
  },
  
  // Status
  label: {
    type: String,
    default: 'Card'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  
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
paymentMethodSchema.index({ userId: 1 });
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

// Security: Mask card display
paymentMethodSchema.methods.toJSON = function() {
  const method = this.toObject();
  if (method.cardLast4) {
    method.cardDisplay = '**** **** **** ' + method.cardLast4;
  }
  return method;
};

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
