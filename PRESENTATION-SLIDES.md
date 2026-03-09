# SwiftChow — Final Year Project Presentation Slides

---

## SLIDE 1 — Title & Overview (15 sec)

- **Project Title:** SwiftChow — An Intelligent Online Food Ordering & Delivery Platform
- **Student Name:** Edwin Ayensu
- **Index Number:** [Your Index Number]
- **Department:** Computer Science
- **Supervisor:** [Supervisor Name]
- **Date:** March 2026

---

## SLIDE 2 — Problem Statement & Motivation (50 sec)

**The Problem:**
- Ordering meals online remains frustrating — customers face lack of transparency, no real-time tracking, and unreliable delivery updates
- In Ghana, most food vendors still rely on phone calls, walk-ins, or WhatsApp — leading to order errors, long wait times, and zero visibility into delivery status
- Customers have no way to get instant support or automated notifications outside business hours

**Why It Matters:**
- Customers demand fast, reliable online food services with live tracking and instant email confirmations
- Socially: reduces queuing time, enables contactless ordering; commercially: opens a direct digital revenue channel for vendors
- The Ghanaian food delivery market is growing rapidly, yet most small-to-medium vendors are underserved

**Existing Solutions & Limitations:**
- Traditional food apps (Glovo, Bolt Food) charge high commissions (15–30%), exclude smaller vendors, and often have poor UI/UX
- WhatsApp/phone ordering has no payment integration, no order tracking, no order history, and no automated notifications
- **SwiftChow solves this** with integrated Flutterwave payments (cards + mobile money), real-time animated order tracking, automated SendGrid email notifications, and an intelligent chatbot — all at low cost

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
- Cart management: add, update, remove items with real-time price calculation (subtotal, 5% tax, GHS 5 delivery fee)
- Order placement with Cash on Delivery or Flutterwave (cards, mobile money)
- Order tracking with 6-stage status progression (Confirmed → Preparing → Ready → Out for Delivery → Delivered)
- Automated email notifications via SendGrid for order confirmation, status updates, and delivery completion
- SwiftChow Bot interaction for order status queries, menu browsing, and site FAQs
- Newsletter subscription with confirmation email

**Non-Functional Requirements:**
- Performance: pages load in < 3 seconds, API response < 500ms
- Security: bcrypt-hashed passwords, JWT authentication, rate limiting, XSS/injection prevention, HTTPS enforced
- Usability: mobile-first responsive design, dark mode toggle, toast notifications
- Scalability: serverless deployment on Vercel, MongoDB Atlas with cached connections

**Target Users & User Stories:**
- General online food customers in Ghana
- *"As a user, I want to track my order in real time so I know exactly when my food arrives"*
- *"As a user, I want email confirmation for my orders so I have a receipt and updates"*
- *"As a user, I want a secure, smooth checkout experience with mobile money support"*

---

## SLIDE 5 — System Design (1 min)

**Architecture:** 3-Tier Client–Server, Serverless Deployment on Vercel
- **Presentation Tier:** HTML5, CSS3, Vanilla JavaScript (18 responsive pages)
- **Application Tier:** Node.js + Express.js REST API (7 route modules, JWT auth middleware, Passport.js)
- **Data Tier:** MongoDB Atlas with cached connections (7 collections: Users, Orders, Cart, Addresses, PaymentMethods, Reviews, NewsletterSubscribers)

**Database Schema (Key Entities):**
- **User:** name, email, password (bcrypt-hashed), Google OAuth fields, favorites, order stats
- **Order:** orderId, items[], deliveryAddress, paymentStatus, 6-stage statusHistory[], rating, timestamps
- **Cart:** userId (unique), items[{foodId, name, price, quantity}]
- **PaymentMethod:** type (card/mobile money), cardLast4 only (PCI-compliant — no full card numbers stored)

**UI/UX Design Highlights:**
- Responsive layout for mobile (320px) to desktop (1440px+) with dark mode toggle
- Hover-activated login/signup modals matching desktop page design
- Track-your-order page with animated motorbike and multi-stage progress bar
- Homepage: hero section with floating cards, deals carousel with touch swipe, category navigation

**Application Flow:**
1. User browses menu → adds items to cart → proceeds to checkout
2. Selects delivery address + payment method → order created server-side with tax/fee calculation
3. Flutterwave processes payment → server-side verification → webhook confirmation (double-validation)
4. Automated SendGrid emails sent at each stage; chatbot provides real-time tracking
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
- **Deployment Migration:** Migrating from Netlify/Render to Vercel required restructuring the serverless entry point and environment configuration
- **Payment Integration:** Flutterwave webhook handling in a stateless serverless environment required careful idempotency design
- **Real-Time Tracking & Emails:** Ensuring order status progression triggers automated SendGrid notifications reliably at each stage
- **Chatbot Natural Language:** Designing 40+ regex intent patterns to cover spelling variations and conversational queries without an NLP library
- **Security vs. UX Balance:** Implementing rate limiting, input validation, and PCI compliance without degrading user experience

**Future Improvements:**
- Improve bot intelligence with NLP/AI integration for smarter responses
- Admin dashboard for vendors to manage menus, view orders, and analytics
- Multi-language support (English, Twi, French) for broader reach
- Mobile app version (React Native) with push notifications
- Real-time tracking with WebSocket/SSE and live map integration
- Redis-backed rate limiting and JWT blacklist for production scale

---

## SLIDE 9 — Live Demo Script (5 min)

**Demo Flow (5 minutes):**

1. **Register / Login & Email Verification (45 sec)**
   - Register a new account → show email verification notification from SendGrid
   - Log in and show JWT-authenticated session
   - Briefly show Google OAuth option

2. **Menu Browsing & Cart (45 sec)**
   - Browse menu categories (Burgers, Pizza, Pastries)
   - Use search to find "Chicken" or "Jollof"
   - Add 3–4 items to cart, adjust quantities
   - Show real-time cart total with 5% tax and GHS 5 delivery fee

3. **Checkout & Flutterwave Payment (1 min)**
   - Select delivery address (or add new one)
   - Choose Flutterwave payment → show inline checkout modal
   - Complete test payment → show server-side verification
   - Show order confirmation email from SendGrid (or screenshot)

4. **Real-Time Order Tracking (45 sec)**
   - Navigate to tracking page → show order status progression
   - Demonstrate the animated motorbike delivery progress and stage indicators
   - Show status history timeline with timestamps

5. **SwiftChow Bot Interaction (45 sec)**
   - Open SwiftChow Bot → ask "Track my order" → show live order status
   - Ask "What burgers do you have?" → show menu results
   - Ask "What are your delivery hours?" → show delivery info
   - Demonstrate time-aware greeting and fun personality responses

6. **Newsletter & Responsiveness (30 sec)**
   - Subscribe to newsletter → show confirmation email
   - Resize browser / switch to mobile view to demonstrate responsive layout
   - Toggle dark mode

7. **Account Dashboard (10 sec)**
   - Show saved addresses, payment methods, order history, user stats

**Fallback:** Backup screenshots of each step are prepared in the slide deck appendix in case of live demo connectivity issues.

---

## SLIDE 10 — Q&A (10 sec)

- **Thank you for your attention!**
- Special thanks to **[Supervisor Name]** for guidance and mentorship
- APIs & services used: Flutterwave, SendGrid, MongoDB Atlas, Vercel, Google OAuth
- **Email:** orders@swiftchow.me
- **GitHub:** github.com/Yawb1/SwiftChow-Website
- **Live Site:** swiftchow.me

*— Questions? —*
