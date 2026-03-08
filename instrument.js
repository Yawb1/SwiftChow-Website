/**
 * SENTRY ERROR TRACKING INITIALIZATION
 * Must be imported at the very top of server.js before anything else
 * Official Sentry best practices: https://docs.sentry.io/platforms/javascript/guides/express/
 */

const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://9aa0cd39b620a666007f25178f97bd27@o4510971816181760.ingest.us.sentry.io/4511006461263872",
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: true,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({
      app: true,
      request: true,
      serverName: true,
    }),
  ],
});

console.log("✅ Sentry initialized for error tracking");
