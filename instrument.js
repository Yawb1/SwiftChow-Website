/**
 * SENTRY ERROR TRACKING INITIALIZATION
 * Must be imported at the very top of server.js before anything else
 */

const Sentry = require("@sentry/node");

if (!process.env.SENTRY_DSN) {
  console.warn("⚠️  SENTRY_DSN not set — error tracking disabled.");
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
