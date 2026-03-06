'use strict';

/**
 * SWIFT CHOW — SendGrid Email Utility
 * ------------------------------------
 * Reusable email helper backed by the SendGrid Web API.
 *
 * Usage:
 *   const sendEmail = require('./utils/sendEmail');
 *   await sendEmail({ to, subject, html, text });
 *
 * Environment variables required:
 *   SENDGRID_API_KEY  — SendGrid API key (starts with "SG.")
 *   EMAIL_FROM        — Verified sender address, e.g. orders@swiftchow.me
 */

const sgMail = require('@sendgrid/mail');

// ── Guard: fail loudly at startup if credentials are absent ──────────────────
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM       = process.env.EMAIL_FROM;

if (!SENDGRID_API_KEY) {
  console.warn('[sendEmail] WARNING: SENDGRID_API_KEY is not set. Emails will not be sent.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('[sendEmail] SendGrid initialised ✔');
}

/**
 * Sends a transactional email via SendGrid.
 *
 * @param {object} options
 * @param {string}  options.to       — Recipient email address (required)
 * @param {string}  options.subject  — Email subject line (required)
 * @param {string}  [options.html]   — HTML body (recommended)
 * @param {string}  [options.text]   — Plain-text fallback (auto-derived if omitted)
 *
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendEmail({ to, subject, html, text }) {
  // ── Input validation ───────────────────────────────────────────────────────
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return { success: false, error: 'Invalid or missing recipient email address.' };
  }
  if (!subject || typeof subject !== 'string') {
    return { success: false, error: 'Invalid or missing email subject.' };
  }
  if (!html && !text) {
    return { success: false, error: 'Email must have either an html or text body.' };
  }

  // ── Runtime guard: skip silently if API key was never set ──────────────────
  if (!SENDGRID_API_KEY) {
    console.warn(`[sendEmail] Skipped — SENDGRID_API_KEY not configured. Would have sent "${subject}" to ${to}`);
    return { success: false, error: 'Email service is not configured.' };
  }

  const from = EMAIL_FROM || 'noreply@swiftchow.me';

  // Plain-text fallback: strip HTML tags if no text body was supplied
  const textBody = text || html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();

  const message = {
    to,
    from,
    subject,
    html,
    text: textBody,
  };

  try {
    const [response] = await sgMail.send(message);
    const messageId = response.headers['x-message-id'] || null;

    console.log(`[sendEmail] ✔ Sent "${subject}" to ${to}${messageId ? ` (id: ${messageId})` : ''}`);
    return { success: true, messageId };

  } catch (err) {
    // SendGrid surfaces detailed errors inside err.response.body
    const detail =
      err.response && err.response.body && err.response.body.errors
        ? err.response.body.errors.map(e => e.message).join('; ')
        : err.message;

    console.error(`[sendEmail] ✖ Failed to send "${subject}" to ${to}: ${detail}`);
    return { success: false, error: detail };
  }
}

module.exports = sendEmail;
