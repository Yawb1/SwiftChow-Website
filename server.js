/**
 * SWIFT CHOW - Server
 * Production-ready Express server with MongoDB and OAuth authentication
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// ============================================
// EMAIL CONFIGURATION
// ============================================

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('Email service not configured:', error.message);
  } else {
    console.log('Email service ready');
  }
});

// Sanitize user input for safe HTML email embedding
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Email helper function
async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SWIFT CHOW <noreply@swiftchow.com>',
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS for frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware (required for JWT cookie extraction)
app.use(cookieParser());

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

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swift-chow';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

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
          <p>Hi ${escapeHtml(fullName)},</p>
          <p>Thank you for signing up! Your account has been created successfully.</p>
          <p style="margin-top: 20px;">You can now:</p>
          <ul style="color: #333;">
            <li>Browse our restaurant menu</li>
            <li>Place orders for delivery</li>
            <li>Track your orders in real-time</li>
            <li>Save your favorite addresses and payment methods</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'https://swiftchow.netlify.app'}" style="background: #FF6B35; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">Start Ordering Now</a>
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
    
    const result = await sendEmail(email, 'Welcome to SWIFT CHOW!', html);
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
          <p>Hi ${escapeHtml(fullName)},</p>
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
    
    const result = await sendEmail(email, 'Password Reset Request - SWIFT CHOW', html);
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
          <p>${fullName ? `Hi ${escapeHtml(fullName)},` : 'Hello,'}</p>
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
    
    const result = await sendEmail(email, 'Newsletter Subscription Confirmed', html);
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
          <p>${fullName ? `Hi ${escapeHtml(fullName)},` : 'Hello,'}</p>
          <p>Thank you for contacting SWIFT CHOW!</p>
          <p><strong>Message Subject:</strong> ${escapeHtml(subject)}</p>
          <p style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #FF6B35; border-radius: 3px;">
            <strong>Your message:</strong><br>
            ${escapeHtml(message)}
          </p>
          <p style="margin-top: 30px;">
            Our team will review your message and get back to you as soon as possible, usually within 24 hours.
          </p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Thank you for being part of the SWIFT CHOW family!
          </p>
        </div>
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p>© 2026 SWIFT CHOW. All rights reserved. | contact@swiftchow.com | +233 50 507 0941</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail(email, `Re: ${subject}`, html);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   SWIFT CHOW SERVER                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}                 ║
║   Port: ${PORT}                               ║
║   URL: http://localhost:${PORT}               ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;

