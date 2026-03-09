# SwiftChow Website — Full Audit Report & Recommendations

**Date:** June 2025  
**Scope:** Complete end-to-end review of backend, frontend, security, performance, and UX

---

## Summary of Changes Applied

### 🔴 Critical Fixes (Applied)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | **PCI DSS violation** — Full card numbers and CVV stored in plaintext | `models/PaymentMethod.js`, `routes/payments.js` | Removed `cardNumber` and `cvv` fields. Now stores only `cardLast4` (last 4 digits). Added card length validation (13-19 digits), expiry month/year validation. |
| 2 | **Order status manipulation** — Any authenticated user could set orders to "delivered" | `routes/orders.js` | Customers restricted to `cancel` only. Status progression enforced server-side. |
| 3 | **Payment amount bypass** — Flutterwave verification used `>=` (overpayment accepted) | `routes/flutterwave.js` | Changed to exact match: `Math.abs(amount - total) < 1` |
| 4 | **Insecure secrets** — JWT_SECRET and SESSION_SECRET were placeholder values | `.env` | Replaced with crypto-random 96-character hex strings |
| 5 | **Error message leaking** — 30+ endpoints exposed `error.message` to clients | `routes/*.js`, `server.js` | All `res.status(500).json({ error: error.message })` replaced with generic safe messages |
| 6 | **Stored XSS** — Review comments accepted raw HTML | `server.js` | HTML tags stripped from review inputs, length limits enforced |
| 7 | **No rate limiting** — Public endpoints (newsletter, reviews) had no abuse protection | `server.js` | In-memory rate limiter added (5 req/min per IP) |
| 8 | **Missing security headers** | `server.js` | Added X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |

### 🟠 Important Fixes (Applied)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 9 | **Cart abuse** — No quantity or item limits | `routes/cart.js` | Max 99 per item, max 50 items, price validated `> 0` |
| 10 | **Chatbot memory leak** — Polling interval never cleared on page unload | `public/js/chatbot.js` | Added `beforeunload` event listener to clear interval |
| 11 | **Git hygiene** — `.qodo/` and `.venv/` not ignored | `.gitignore` | Added `.qodo/` to gitignore, removed stale directories |

---

## Remaining Recommendations

### 🔴 Critical (Should Fix Before Production)

#### 1. Server-Side Price Validation
**File:** `routes/cart.js`, `routes/orders.js`  
**Issue:** Cart prices are accepted directly from the client. A malicious user can set any price via API.  
**Fix:** Maintain a server-side menu/catalog (database or config). When adding to cart or creating an order, look up the item price server-side and reject mismatches.

#### 2. Rate Limiting on Auth Endpoints
**Files:** `routes/auth.js`, `server.js`  
**Issue:** Login, registration, and password reset have no rate limiting. Vulnerable to brute-force and credential stuffing attacks.  
**Fix:** Add rate limiting (e.g., 5 login attempts per 15 minutes per IP/email). Consider using `express-rate-limit` package for Redis-backed production rate limiting.

#### 3. Unauthenticated Email Endpoints
**File:** `server.js`  
**Issue:** `/api/emails/order-confirmation` and `/api/emails/welcome` endpoints are publicly accessible. An attacker could use them to send spam via your SendGrid account.  
**Fix:** Add authentication middleware (`auth`) to email endpoints, or make them internal-only (called from within route handlers, not exposed as API routes).

#### 4. JWT Token Invalidation
**Files:** `middleware/auth.js`, `routes/auth.js`  
**Issue:** Logging out only clears the token from the client. The token remains valid for its full 7-day lifetime. Stolen tokens cannot be revoked.  
**Fix:** Implement a token blacklist (Redis or MongoDB) checked on each authenticated request, or switch to shorter-lived tokens with refresh token rotation.

#### 5. Install `helmet.js`
**File:** `server.js`  
**Issue:** Manual security headers are a start, but `helmet` provides comprehensive protection including CSP, HSTS, and others.  
**Fix:** `npm install helmet` and add `app.use(helmet())` before routes.

#### 6. Use Production Rate Limiter
**File:** `server.js`  
**Issue:** The in-memory rate limiter will not work across multiple Vercel serverless instances (each function invocation has its own memory).  
**Fix:** Replace with `express-rate-limit` backed by a Redis store (e.g., Upstash Redis for serverless) or use Vercel's edge rate limiting.

### 🟠 Important (Should Fix Soon)

#### 7. CSRF Protection
**Issue:** No CSRF tokens on form submissions. While JWT-based auth mitigates some CSRF risks, cookie-based sessions (used alongside JWT) are still vulnerable.  
**Fix:** Add `csurf` middleware or implement double-submit cookie pattern.

#### 8. Google OAuth Account Linking
**File:** `config/passport.js`  
**Issue:** Google OAuth links accounts by email. If a user registers with email+password, then someone else authenticates via Google with the same email, the accounts merge silently.  
**Fix:** Require explicit account linking confirmation from the user when an email collision is detected.

#### 9. Input Validation Library
**Files:** All route files  
**Issue:** Input validation is manual and inconsistent. Some fields validated, others not. Phone validation is too loose.  
**Fix:** Use `express-validator` or `joi` for consistent, declarative validation schemas on all endpoints.

#### 10. MongoDB Injection Prevention
**Files:** All route files  
**Issue:** While Mongoose provides some protection, `req.body` objects are passed directly to queries in some places. A crafted `$gt`/`$ne` operator could bypass filters.  
**Fix:** Use `mongo-sanitize` package or explicitly cast/validate all query parameters.

#### 11. Missing `googleSignup()` Function
**File:** `public/js/modals.js`  
**Issue:** `googleSignup()` is called from the signup form but is never defined. Google signup will fail silently.  
**Fix:** Implement the function or wire it to the existing `googleLogin()` with a signup flag.

#### 12. Error Handling Consistency
**Files:** All route files  
**Issue:** Some routes return `{ error: '...' }`, others `{ message: '...' }`. Frontend has to check both.  
**Fix:** Standardize all error responses to `{ success: false, error: '...' }` and success responses to `{ success: true, data: {...} }`.

#### 13. Environment Variable Validation
**File:** `server.js`  
**Issue:** Server starts even if critical env vars (MONGODB_URI, JWT_SECRET, SENDGRID_API_KEY) are missing, leading to cryptic runtime errors.  
**Fix:** Add startup validation that checks for required env vars and exits with clear error messages if missing.

### 🟡 Optional (Nice to Have)

#### 14. Accessibility Improvements
**Files:** All HTML files  
**Issue:** Missing form labels, no ARIA attributes on modals, no focus trapping in modal dialogs, carousel not keyboard-navigable.  
**Fix:** Add `<label>` elements, `aria-label`/`aria-labelledby` attributes, focus trap in modals, keyboard event handlers on carousel.

#### 15. Favicon Consistency
**Files:** HTML files  
**Issue:** Some pages reference `logo.png`, others `favicon.svg`, and some have no favicon reference.  
**Fix:** Standardize on one favicon file referenced across all pages.

#### 16. CSS Performance
**File:** `public/css/styles.css`  
**Issue:** Single 4000+ line CSS file with no minification. Contains duplicate/overlapping media queries.  
**Fix:** Consider CSS splitting per page, minification in build step, and consolidating media queries.

#### 17. Image Optimization
**Files:** HTML files, `public/js/data.js`  
**Issue:** Images loaded from external URLs without `loading="lazy"`, no srcset for responsive images, no WebP fallbacks.  
**Fix:** Add `loading="lazy"` to below-fold images, use responsive image techniques.

#### 18. Frontend Bundle Optimization
**Files:** `public/js/*.js`  
**Issue:** 8 separate JS files loaded on every page. No minification, no bundling, no tree-shaking.  
**Fix:** Consider a build step with Vite or esbuild for bundling and minification. Only load chatbot.js, recommendations.js on relevant pages.

#### 19. Carousel Memory Leak
**File:** `public/js/main.js`  
**Issue:** Hero carousel `setInterval` is not cleared when navigating away (SPA-like behavior) or when the carousel element is not present.  
**Fix:** Check for carousel element existence, clear interval on page unload.

#### 20. Database Indexing
**Files:** Model files  
**Issue:** Frequent queries (orders by userId, cart by userId) may lack proper indexes.  
**Fix:** Add compound indexes: `{ userId: 1, createdAt: -1 }` on Order model, `{ userId: 1 }` on Cart model. Review with `db.collection.explain()`.

---

## Architecture Notes

| Aspect | Current State | Recommendation |
|--------|---------------|----------------|
| **Deployment** | Vercel serverless | Good for current scale. Consider edge functions for rate limiting. |
| **Database** | MongoDB Atlas | Add connection pooling config for serverless. Set `maxPoolSize: 10`. |
| **Auth** | JWT + Passport | Solid. Add refresh token rotation for better security. |
| **Payments** | Flutterwave sandbox | Before going live: switch to production keys, add webhook signature verification. |
| **Email** | SendGrid | Good. Consider adding email template versioning. |
| **Error Tracking** | Sentry | Good. Ensure dsn is set and errors are properly tagged. |
| **Frontend** | Vanilla JS | Adequate for current complexity. If features grow significantly, consider a lightweight framework. |

---

## Files Modified in This Audit

| File | Changes |
|------|---------|
| `models/PaymentMethod.js` | Removed card/CVV storage, added cardLast4, validation |
| `routes/payments.js` | Card validation, mobile money validation, stores only last4, standardized JSON |
| `routes/cart.js` | Quantity limits, item limits, price validation, input sanitization, standardized JSON |
| `routes/orders.js` | Customer status restrictions, standardized error/success JSON responses |
| `routes/flutterwave.js` | Exact payment amount verification, standardized JSON |
| `routes/addresses.js` | Safe error responses, standardized JSON with `success: false` |
| `routes/users.js` | Safe error responses, standardized JSON with `success: false` |
| `server.js` | Rate limiter, security headers, review hardening, safe errors, env validation, global error handler fixed |
| `public/js/chatbot.js` | Memory leak fix (beforeunload cleanup) |
| `public/js/main.js` | Carousel memory leak fix (beforeunload cleanup) |
| `public/tracking.html` | Added lazy loading to below-fold image |
| `public/account.html` | Added aria-labels to modal close buttons |
| All 14 pages with cart modal | Added `role="dialog"` and `aria-label` to cart modal overlays |
| `.gitignore` | Added .qodo/ |

## Files/Directories Removed

| Item | Reason |
|------|--------|
| `.qodo/` | Empty tool cache directory |
| `.venv/` | Python virtual environment (1519 files), not needed for Node.js project |

---

*Report generated as part of comprehensive SwiftChow website audit.*
