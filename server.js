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
    console.error(`âŒ Missing required environment variable: ${varName}`);
  }
});

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`âš ï¸  Optional environment variable not set: ${varName}`);
  }
});

// ============================================
// EMAIL CONFIGURATION (SendGrid)
// ============================================
const sendEmail = require('./utils/sendEmail');
const emailTemplates = require('./utils/emailTemplates');
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
  secret: process.env.SESSION_SECRET,
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
    console.log('âœ… MongoDB connected successfully');
  } catch (error) {
    isConnected = false;
    console.error('âŒ MongoDB connection failed:', error.message);
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

// Flutterwave payment routes
app.use('/api/flutterwave', require('./routes/flutterwave'));

// ============================================
// SIMPLE RATE LIMITER (in-memory, per-IP)
// Protects unauthenticated endpoints from spam/abuse
// ============================================
const rateLimitStore = new Map();
function rateLimit(maxRequests, windowMs) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.start > windowMs) {
      rateLimitStore.set(key, { start: now, count: 1 });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}
// Clean up every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (now - val.start > 600000) rateLimitStore.delete(key);
  }
}, 600000);

// ============================================
// SECURITY HEADERS
// ============================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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
    
    const html = emailTemplates.welcome({ firstName: fullName.split(' ')[0] || fullName });
    
    const result = await sendEmail({ to: email, subject: 'Welcome to SWIFT CHOW!', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Send password reset confirmation
app.post('/api/emails/password-reset', async (req, res) => {
  try {
    const { email, fullName, resetLink } = req.body;
    
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and fullName required' });
    }
    
    const html = emailTemplates.passwordReset({
      firstName: fullName.split(' ')[0] || fullName,
      resetUrl: resetLink || (process.env.CLIENT_URL || 'https://swiftchow.me')
    });
    
    const result = await sendEmail({ to: email, subject: 'Password Reset Request - SWIFT CHOW', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Send newsletter subscription confirmation
app.post('/api/emails/newsletter-confirmation', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const html = emailTemplates.newsletterWelcome({ email });
    
    const result = await sendEmail({ to: email, subject: 'Newsletter Subscription Confirmed', html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Send contact form response
app.post('/api/emails/contact-response', async (req, res) => {
  try {
    const { email, fullName, subject, message } = req.body;
    
    if (!email || !subject) {
      return res.status(400).json({ error: 'Email and subject required' });
    }
    
    const html = emailTemplates.contactReply({
      firstName: fullName ? fullName.split(' ')[0] : null,
      subject,
      message: message || ''
    });
    
    const result = await sendEmail({ to: email, subject: `Re: ${subject}`, html });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Subscribe to newsletter (saves to MongoDB + sends confirmation email)
app.post('/api/newsletter/subscribe', rateLimit(5, 60000), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed!' });
    }

    // Save to MongoDB
    await new NewsletterSubscriber({ email }).save();

    // Send confirmation email
    const html = emailTemplates.newsletterWelcome({ email });

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
    timestamp: new Date().toISOString()
  });
});

// ============================================
// REVIEW SUBMISSION + EMAIL CONFIRMATION
// ============================================
const Review = require('./models/Review');

app.post('/api/reviews/submit', rateLimit(5, 60000), async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (typeof name !== 'string' || name.length > 100) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (typeof comment !== 'string' || comment.length > 2000) {
      return res.status(400).json({ error: 'Comment must be under 2000 characters' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Sanitize comment â€” strip HTML tags to prevent stored XSS
    const sanitizedComment = String(comment).replace(/<[^>]*>/g, '');

    const review = new Review({ name: String(name).slice(0, 100), email, rating: Number(rating), comment: sanitizedComment });
    await review.save();

    // Send confirmation email
    try {
      const html = emailTemplates.reviewThankYou({ name, rating });
      await sendEmail({ to: email, subject: 'Thank you for your review - SWIFT CHOW', html });
    } catch (emailErr) {
      console.warn('Could not send review confirmation email:', emailErr.message);
    }

    res.json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Review submission error:', error.message);
    res.status(500).json({ error: 'Failed to submit review. Please try again.' });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again.' });
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
// SENTRY ERROR HANDLER (Sentry official best practice)
// ============================================
Sentry.setupExpressErrorHandler(app);

// ============================================
// ERROR HANDLING (must come after Sentry handler)
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Sentry's handler may have already started sending a response
  if (res.headersSent) {
    return next(err);
  }
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
      status: status
    }
  });
});

// ============================================
// SERVER STARTUP (local dev only â€” skipped on Vercel)
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
  // Don't exit on Vercel â€” serverless functions should survive transient errors
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

module.exports = app;

