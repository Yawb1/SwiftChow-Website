/**
 * SWIFT CHOW - Server
 * Production-ready Express server with MongoDB and OAuth authentication
 */

// IMPORTANT: Initialize Sentry first, before anything else
require("./instrument.js");
const Sentry = require("@sentry/node");

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET'];
const optionalEnvVars = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'CLIENT_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
  }
});

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Optional environment variable not set: ${varName}`);
  }
});

// ============================================
// EMAIL CONFIGURATION (SendGrid)
// ============================================
const sendEmail = require('./utils/sendEmail');
const NewsletterSubscriber = require('./models/NewsletterSubscriber');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS for frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://swiftchow.me',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Load Passport strategies
require('./config/passport');

// Static files (serve frontend from public/)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Cache HTML files for 1 hour, assets for 1 day
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ============================================
// DATABASE CONNECTION
// ============================================

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swift-chow';
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// Ensure DB is connected before any API route (critical for Vercel serverless cold starts)
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB middleware error:', error.message);
    res.status(503).json({ error: { message: 'Service temporarily unavailable', status: 503 } });
  }
});

// ============================================
// ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// User routes
app.use('/api/users', require('./routes/users'));

// Cart routes
app.use('/api/cart', require('./routes/cart'));

// Order routes
app.use('/api/orders', require('./routes/orders'));

// Address routes
app.use('/api/addresses', require('./routes/addresses'));

// Payment methods routes
app.use('/api/payments', require('./routes/payments'));

// ============================================
// EMAIL ENDPOINTS
// ============================================

// Send signup confirmation email
app.post('/api/emails/signup-confirmation', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and fullName required' });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to SWIFT CHOW!</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>Hi ${fullName},</p>
          <p>Thank you for signing up! Your account has been created successfully.</p>
          <p style="margin-top: 20px;">You can now:</p>
          <ul style="color: #333;">
            <li>Browse our restaurant menu</li>
            <li>Place orders for delivery</li>
            <li>Track your orders in real-time</li>
            <li>Save your favorite addresses and payment methods</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'https://swiftchow.me'}" style="background: #FF6B35; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">Start Ordering Now</a>
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not create this account, please contact us immediately.
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>© 2026 SWIFT CHOW. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail({ to: email, subject: 'Welcome to SWIFT CHOW!', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send password reset confirmation
app.post('/api/emails/password-reset', async (req, res) => {
  try {
    const { email, fullName, resetLink } = req.body;
    
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and fullName required' });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>Hi ${fullName},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <p style="margin-top: 30px; text-align: center;">
            <a href="${resetLink || process.env.CLIENT_URL}" style="background: #FF6B35; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">Reset Password</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            If you did not request a password reset, please ignore this email or contact support.
          </p>
          <p style="font-size: 12px; color: #666;">
            This link will expire in 24 hours.
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>© 2026 SWIFT CHOW. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail({ to: email, subject: 'Password Reset Request - SWIFT CHOW', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send newsletter subscription confirmation
app.post('/api/emails/newsletter-confirmation', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Newsletter Subscription Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>${fullName ? `Hi ${fullName},` : 'Hello,'}</p>
          <p>Thank you for subscribing to the SWIFT CHOW newsletter!</p>
          <p>You will now receive:</p>
          <ul style="color: #333;">
            <li>Exclusive restaurant recommendations</li>
            <li>Special promotional offers</li>
            <li>New menu launches</li>
            <li>Tips and food guides</li>
          </ul>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            You can manage your subscription preferences in your account settings anytime.
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>© 2026 SWIFT CHOW. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail({ to: email, subject: 'Newsletter Subscription Confirmed', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send contact form response
app.post('/api/emails/contact-response', async (req, res) => {
  try {
    const { email, fullName, subject, message } = req.body;
    
    if (!email || !subject) {
      return res.status(400).json({ error: 'Email and subject required' });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">We Received Your Message</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>${fullName ? `Hi ${fullName},` : 'Hello,'}</p>
          <p>Thank you for contacting SWIFT CHOW!</p>
          <p><strong>Message Subject:</strong> ${subject}</p>
          <p style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #FF6B35; border-radius: 3px;">
            <strong>Your message:</strong><br>
            ${message}
          </p>
          <p style="margin-top: 30px;">
            Our team will review your message and get back to you as soon as possible, usually within 24 hours.
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Thank you for being part of the SWIFT CHOW family!
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>© 2026 SWIFT CHOW. All rights reserved. | orders@swiftchow.me</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail({ to: email, subject: `Re: ${subject}`, html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to newsletter (saves to MongoDB + sends confirmation email)
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed!' });
    }

    // Save to MongoDB
    await new NewsletterSubscriber({ email }).save();

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to SwiftChow Newsletter</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <p>Thank you for subscribing to the SwiftChow newsletter.</p>
          <p>You will now receive:</p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Exclusive deals</li>
            <li>New menu updates</li>
            <li>Special promotions</li>
          </ul>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If this wasn't you, simply ignore this email.
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>&copy; 2026 SWIFT CHOW. All rights reserved. | orders@swiftchow.me</p>
        </div>
      </div>
    `;

    await sendEmail({ to: email, subject: 'Welcome to SwiftChow Newsletter', html });

    res.json({ success: true, message: 'Thanks for subscribing! Check your inbox for a welcome email.' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user._id, email: req.user.email } : null
  });
});

// ── Test email route ─────────────────────────────────────────────────────────
// GET /api/test-email
// Sends a test email to the address defined in EMAIL_FROM and returns the result.
app.get('/api/test-email', async (req, res) => {
  const recipient = process.env.EMAIL_FROM;

  if (!recipient) {
    return res.status(500).json({
      success: false,
      error: 'EMAIL_FROM is not set in the environment. Cannot determine recipient.'
    });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <div style="background: #FF6B35; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #fff; font-size: 24px;">SWIFT CHOW — Test Email</h1>
      </div>
      <div style="padding: 28px; background: #f9fafb;">
        <p style="margin: 0 0 12px; color: #111827; font-size: 16px;">
          ✅ <strong>SendGrid is working correctly.</strong>
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
          <strong>Sent at:</strong> ${new Date().toUTCString()}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
        </p>
      </div>
      <div style="background: #1f2937; color: #9ca3af; padding: 16px; text-align: center; font-size: 12px;">
        © 2026 SWIFT CHOW. This is an automated test message — no action required.
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: recipient,
    subject: 'SWIFT CHOW — SendGrid Test Email',
    html
  });

  if (result.success) {
    return res.json({
      success: true,
      message: `Test email sent successfully to ${recipient}.`,
      messageId: result.messageId || null
    });
  }

  return res.status(500).json({
    success: false,
    message: `Failed to send test email to ${recipient}.`,
    error: result.error
  });
});

// ============================================
// REVIEW SUBMISSION + EMAIL CONFIRMATION
// ============================================
const Review = require('./models/Review');

app.post('/api/reviews/submit', async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = new Review({ name, email, rating: Number(rating), comment });
    await review.save();

    // Send confirmation email
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #DC2626; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Thank You for Your Review!</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <p>Hi ${name},</p>
            <p>Thank you for sharing your experience with SwiftChow.</p>
            <p>We appreciate your feedback and it helps us improve our service.</p>
            <p style="margin-top: 20px;"><strong>Your rating:</strong> ${'&#9733;'.repeat(Number(rating))}${'&#9734;'.repeat(5 - Number(rating))}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              If you have any further questions, feel free to reach out to us at orders@swiftchow.me
            </p>
          </div>
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p>&copy; 2026 SWIFT CHOW. All rights reserved.</p>
          </div>
        </div>
      `;
      await sendEmail({ to: email, subject: 'Thank you for your review - SWIFT CHOW', html });
    } catch (emailErr) {
      console.warn('Could not send review confirmation email:', emailErr.message);
    }

    res.json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FRONTEND FALLBACK
// ============================================

// Serve HTML files for SPA routing
app.get('*', (req, res, next) => {
  // Skip API calls
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Page not found' });
    }
  });
});

// ============================================
// SENTRY ERROR HANDLER (before other error handlers)
// ============================================
app.use(Sentry.Handlers.errorHandler());

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// ============================================
// SERVER STARTUP (local dev only — skipped on Vercel)
// ============================================

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`\n  SWIFT CHOW SERVER\n  Environment: ${process.env.NODE_ENV || 'development'}\n  Port: ${PORT}\n  URL: http://localhost:${PORT}\n`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit on Vercel — serverless functions should survive transient errors
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

module.exports = app;

