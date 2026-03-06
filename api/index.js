/**
 * SWIFT CHOW — Vercel Serverless Entry Point
 * ────────────────────────────────────────────
 * Wraps the existing Express app as a single Vercel serverless function.
 * All requests matching /api/* are forwarded here via vercel.json rewrites.
 */

const app = require('../server');

module.exports = app;
