# SwiftChow — Final Year Project Presentation Slides

---

## SLIDE 1 — Title & Overview (15 sec)

- **Project Title:** SwiftChow — An Intelligent Online Food Ordering & Delivery Platform
- **Student Name:** [Your Name]
- **Index Number:** [Your Index Number]
- **Department:** [Department Name], [University Name]
- **Supervisor:** [Supervisor's Name]
- **Date:** March 2026

---

## SLIDE 2 — Problem Statement & Motivation (50 sec)

**The Problem:**
- In Ghana, many local food vendors lack an online ordering platform, forcing customers to rely on phone calls, walk-ins, or informal WhatsApp orders — resulting in order errors, long wait times, and no tracking visibility
- Customers have no way to track delivery status in real-time or get instant support outside business hours

**Why It Matters:**
- The Ghanaian food delivery market is growing rapidly, yet most small-to-medium vendors are underserved by existing platforms
- Socially: reduces physical queuing time, enables contactless ordering post-COVID
- Commercially: opens a direct digital revenue channel for vendors and creates job opportunities for delivery riders

**Existing Solutions & Limitations:**
- Platforms like Glovo and Bolt Food operate in major cities but charge high commission fees (15–30%) and exclude smaller vendors
- WhatsApp/phone ordering has no payment integration, no order tracking, and no order history
- SwiftChow fills this gap as a low-cost, full-featured, vendor-friendly platform with integrated payments, AI chatbot, and real-time tracking

---

## SLIDE 3 — Project Objectives (45 sec)

1. **Design and develop** a responsive, full-stack web application for online food ordering with menu browsing, cart management, and secure checkout
2. **Integrate secure online payment processing** via Flutterwave (supporting cards and mobile money — Ghana's most popular payment method)
3. **Implement real-time order tracking** with automated status progression and email notifications at each stage
4. **Build an intelligent chatbot assistant** that handles order tracking, menu queries, delivery info, and customer support — without external AI dependencies
5. **Deploy a production-ready platform** on Vercel with MongoDB Atlas, achieving fast load times, mobile responsiveness, and enterprise-grade security

---

## SLIDE 4 — System Analysis & Requirements (1 min)

**Functional Requirements:**
- User registration/login with email verification and Google OAuth
- Browse 44+ menu items across 9 categories with search, filter, and dietary info
- Shopping cart with real-time price calculation (subtotal, 5% tax, delivery fee)
- Checkout with Cash on Delivery or Flutterwave (cards, mobile money)
- Order tracking with 6-stage status progression (Confirmed → Preparing → Ready → Out for Delivery → Delivered)
- Intelligent chatbot for order tracking, FAQs, menu browsing, and support
- User account management: saved addresses, payment methods, order history, favorites

**Non-Functional Requirements:**
- Performance: pages load in < 3 seconds, API response < 500ms
- Security: JWT authentication, rate limiting, XSS/injection prevention, PCI-compliant card handling
- Usability: mobile-first responsive design, dark mode, toast notifications
- Reliability: automated email notifications, Sentry error monitoring

**Target Users:**
- *"As a hungry student, I want to browse nearby food options, place an order with mobile money, and track my delivery in real-time from my phone"*
- *"As a vendor, I want to receive orders digitally with calculated totals and payment confirmation"*

---

## SLIDE 5 — System Design (1 min)

**Architecture:** 3-Tier Client–Server Architecture
- **Presentation Tier:** HTML5, CSS3, Vanilla JavaScript (18 pages, responsive)
- **Application Tier:** Node.js + Express.js REST API (7 route modules, JWT auth middleware)
- **Data Tier:** MongoDB Atlas (7 collections: Users, Orders, Cart, Addresses, PaymentMethods, Reviews, NewsletterSubscribers)

**Database Schema (Key Entities):**
- **User:** name, email, password (bcrypt-hashed), Google OAuth, favorites, stats
- **Order:** orderId, items[], delivery address, payment status, 6-stage statusHistory[], rating, timestamps
- **Cart:** userId (unique), items[{foodId, name, price, quantity}]
- **PaymentMethod:** type (card/mobile money), cardLast4 (PCI-compliant — no full numbers stored), provider

**Application Flow:**
1. User browses menu → adds items to cart → proceeds to checkout
2. Selects delivery address + payment method → order created server-side
3. Flutterwave processes payment → webhook confirms → order status begins progressing
4. Automated emails sent at each stage; chatbot provides real-time tracking
5. User rates and reviews after delivery

---

## SLIDE 6 — Implementation (1 min)

**Technology Stack:**
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (4000+ lines), Vanilla JS (8 modules) |
| Backend | Node.js 24.x, Express.js 4.18 |
| Database | MongoDB Atlas via Mongoose 7.5 ODM |
| Authentication | JWT + Passport.js (Local + Google OAuth 2.0) |
| Payments | Flutterwave API (cards, mobile money, bank transfer) |
| Email | SendGrid API (transactional emails with HTML templates) |
| Error Monitoring | Sentry SDK |
| Deployment | Vercel Serverless Functions |

**Key Modules Implemented:**
- **Authentication System:** Register, login, Google OAuth, email verification, password reset with secure token flow
- **Order Pipeline:** Server-side total calculation, tax/delivery fee, 6-stage tracking with timestamp history
- **Flutterwave Integration:** Client-side inline checkout → server-side verification → webhook confirmation (double-validation)
- **SwiftChow Bot:** Rule-based intelligent chatbot with 40+ intent patterns — order tracking, menu search, time-aware greetings, fun personality
- **Security Layer:** Rate limiting, XSS sanitization, security headers, PCI-compliant card storage

**Key Interfaces:**
- Homepage with hero section, deals carousel, category navigation
- Interactive menu page with search, filter, and add-to-cart
- Real-time order tracking page with animated progress
- Account dashboard with profile, addresses, payment methods, order history

---

## SLIDE 7 — Testing & Evaluation (1 min)

**Testing Methods:**
- **Manual Functional Testing:** All 25+ API endpoints tested via Postman — registration, login, cart CRUD, order creation, payment flow, status updates
- **Security Audit:** Comprehensive code review covering OWASP Top 10 — identified and fixed 11 critical/important vulnerabilities (PCI violation, XSS, error leaking, status manipulation)
- **Cross-Browser Testing:** Verified on Chrome, Firefox, Safari, Edge — desktop and mobile viewports
- **User Acceptance Testing:** Tested with sample users for complete order flow (browse → cart → checkout → track → rate)

**Key Results:**
- 8 critical security issues identified and resolved (documented in AUDIT-REPORT.md)
- Order creation-to-delivery email flow working end-to-end
- Flutterwave payment verification with exact amount matching (prevents underpayment/overpayment exploits)
- Chatbot successfully handles order tracking queries, menu searches, and 40+ conversation intents
- All 18 pages responsive across 320px to 1440px+ viewports

**Reliability Metrics:**
- Sentry error monitoring active in production
- Rate limiting prevents API abuse (5 requests/minute on public endpoints)
- JWT token authentication with 7-day expiry

---

## SLIDE 8 — Conclusion, Challenges & Future Work (1 min)

**Achievements:**
- Successfully built and deployed a full-stack food delivery platform serving the Ghanaian market
- Integrated Flutterwave payments with mobile money support — critical for the target demographic
- Implemented an intelligent, self-contained chatbot without reliance on external AI APIs
- Achieved enterprise-grade security practices: PCI compliance, XSS prevention, rate limiting, secure authentication
- Fully deployed on Vercel with MongoDB Atlas — zero-downtime, auto-scaling serverless architecture

**Key Challenges:**
- **Payment Integration:** Flutterwave webhook handling in a stateless serverless environment required careful idempotency design
- **Security vs. UX Balance:** Implementing rate limiting and input validation without degrading user experience
- **Chatbot Natural Language:** Designing comprehensive regex pattern matching to cover spelling variations and conversational intent without an NLP library
- **Serverless Constraints:** In-memory rate limiting doesn't persist across Vercel function instances — planned migration to Redis

**Future Improvements:**
- Mobile app (React Native) for push notifications and offline menu browsing
- Real-time order tracking with WebSocket/SSE and live map integration
- Vendor dashboard for restaurant owners to manage menus and orders
- AI-powered food recommendations based on order history and preferences
- Redis-backed rate limiting and JWT blacklist for production scale
- Multi-vendor marketplace model with commission management

---

## SLIDE 9 — Live Demo Script (5 min)

**Demo Flow (5 minutes):**

1. **Homepage Tour (30 sec)**
   - Show responsive homepage with hero section, deals carousel, category navigation
   - Toggle dark mode to demonstrate theme switching

2. **User Registration & Login (45 sec)**
   - Register a new account → show email verification flow
   - Log in and show JWT-authenticated session
   - Briefly show Google OAuth option

3. **Menu Browsing & Cart (1 min)**
   - Browse menu categories (Burgers, Pizza, Pastries)
   - Use search to find "Jollof" or "Chicken"
   - Add 3–4 items to cart, adjust quantities
   - Show real-time cart total with tax and delivery fee

4. **Checkout & Payment (1 min)**
   - Select delivery address (or add new one)
   - Choose Flutterwave payment → show inline checkout modal
   - Complete test payment → show server-side verification
   - Show order confirmation email (or screenshot)

5. **Order Tracking (45 sec)**
   - Navigate to tracking page → show order status progression
   - Demonstrate the animated delivery progress UI
   - Show status history timeline

6. **Chatbot Demo (45 sec)**
   - Open SwiftChow Bot → ask "Track my order"
   - Ask "What burgers do you have?" → show menu results
   - Ask "What are your delivery hours?"
   - Show time-aware greeting and fun personality features

7. **Account Dashboard (15 sec)**
   - Show saved addresses, payment methods, order history
   - Show user stats (total orders, total spent)

**Fallback:** If live demo has connectivity issues, prepared screenshots of each step are available in the slide deck appendix.

---

## SLIDE 10 — Q&A (10 sec)

- **Thank you for your attention!**
- Special thanks to **[Supervisor's Name]** for guidance and mentorship
- APIs & services used: Flutterwave, SendGrid, MongoDB Atlas, Vercel, Google OAuth
- **GitHub:** github.com/Yawb1/SwiftChow-Website
- **Live Site:** swiftchow.me
- **Contact:** [Your Email]

*— Questions? —*
