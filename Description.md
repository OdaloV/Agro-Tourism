##  Overview

HarvestHost is a full‑stack agritourism platform connecting visitors with authentic farm experiences in Kenya. Farmers can list activities, manage bookings, and receive payouts via bank transfer. Visitors discover farms, book activities, pay with M‑Pesa, and message farmers directly. The platform includes escrow payment handling, automated farmer payouts, admin verification, and two‑factor authentication.

**Live Demo:** [Coming Soon](#)

---

##  Features

###  For Visitors

| Feature | Description |
|---------|-------------|
|  **Browse Farms** | Search, filter, and explore farms by location, activity type, or price |
|  **Book Activities** | Real‑time availability with instant confirmation |
|  **M‑Pesa Payments** | Secure STK push payments via IntaSend integration |
|  **Email Notifications** | Booking confirmations and reminders |
|  **Reviews & Ratings** | Rate farms after completed visits |
|  **In‑App Chat** | Direct messaging with farmers |
|  **Booking History** | Track all past and upcoming bookings |
|  **Request Refund** | Eligible bookings can be refunded |

###  For Farmers

| Feature | Description |
|---------|-------------|
|  **Farm Profile** | Manage description, photos, facilities, and location |
|  **Activity Management** | List activities with price, duration, and capacity |
|  **Schedule View** | Calendar view of all bookings |
|  **Booking Management** | Approve, reject, or mark bookings as completed |
|  **Automated Payouts** | Receive 90% of booking value (10% platform fee) via bank transfer |
|  **Bank Details** | Manage payout account information |
|  **Message Visitors** | Respond to inquiries and reviews |
|  **Analytics Dashboard** | View earnings, booking trends, and farm performance |

###  For Admin

| Feature | Description |
|---------|-------------|
|  **Farm Verification** | Review and approve farmer profiles and documents |
|  **Platform Stats** | Monitor bookings, revenue, and pending verifications |
|  **System Management** | Manage all users, farms, and bookings |
|  **Refund Processing** | Handle dispute resolutions and refunds |

###  Security Features

| Feature | Description |
|---------|-------------|
|  **JWT Authentication** | Secure, httpOnly cookie-based sessions |
|  **Single Session Per User** | New login invalidates previous sessions |
|  **Role‑Based Access** | Visitor, farmer, and admin roles with strict permissions |
|  **Two‑Factor Authentication** | Email OTP for enhanced account security |
|  **Hidden Admin Login** | Secret‑protected admin access URL |
|  **CSRF Protection** | Tokens for state‑changing requests |
|  **Rate Limiting** | Protection against brute‑force on admin endpoints |
|  **Input Validation** | SQL injection prevention via parameterised queries |

---

##  Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, RSC) |
| **Language** | TypeScript |
| **Database** | PostgreSQL 16 (connection pooling) |
| **Authentication** | JWT (jose) + httpOnly cookies |
| **Styling** | Tailwind CSS + Framer Motion |
| **Payments** | IntaSend API (M‑Pesa collection, bank payouts, refunds) |
| **Email** | Resend (transactional emails, OTP) |
| **SMS** | Africa’s Talking (optional notifications) |
| **Calendar** | Google Calendar API |
| **Cache** | Upstash Redis |

---

##  Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm / yarn / bun

### Step‑by‑Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/harvesthost.git
cd harvesthost

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 4. Create the database
createdb harvesthostdb

# 5. Run schema migrations (provide your own schema.sql)
psql -d harvesthostdb -f database/schema.sql

# 6. Start development server
npm run dev
```
## Database
DATABASE_URL=postgresql://user:password@localhost:5432/harvesthostdb

## JWT
JWT_SECRET=your-super-secret-key-change-in-production

## Email (Resend)
RESEND_API_KEY=re_xxxxxxxx

## IntaSend (Sandbox / Live)
INTASEND_PUBLISHABLE_KEY=ISPubKey_test_xxxx
INTASEND_SECRET_KEY=ISSecretKey_test_xxxx
INTASEND_ENVIRONMENT=sandbox

## M‑Pesa (for direct STK – IntaSend handles this)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/mpesa/callback

## Africa's Talking (optional)
AFRICAS_TALKING_API_KEY=...
AFRICAS_TALKING_USERNAME=sandbox
SMS_SENDER_ID=HarvestHost

## Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

## Admin Secret (hidden login)
ADMIN_SECRET=your_super_secret_admin_key
NEXT_PUBLIC_ADMIN_SECRET=your_super_secret_admin_key

## App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

src/
├── app/
│   ├── api/               # Next.js API routes
│   │   ├── admin/         # Admin endpoints (stats, verifications)
│   │   ├── auth/          # Login, register, 2FA, logout
│   │   ├── bookings/      # Booking CRUD, refunds
│   │   ├── farmer/        # Farmer profile, schedule, earnings
│   │   ├── marketplace/   # Product listings
│   │   ├── payments/      # Initiate, release, webhook, refund
│   │   └── messages/      # Chat conversations
│   ├── admin/             # Admin dashboard pages
│   ├── farmer/            # Farmer dashboard pages
│   ├── visitor/           # Visitor dashboard pages
│   ├── auth/              # Authentication pages & 2FA
│   ├── farms/             # Public farm listings & detail
│   ├── marketplace/       # Product listing & detail
│   └── marketing/         # Landing page (minimalist)
├── components/            # Reusable UI components
│   ├── layout/            # Header, BottomNav
│   ├── sections/          # Hero, Categories, etc.
│   └── ui/                # Button, Skeleton, Card, Modal
├── lib/                   # Utilities, DB pool, auth helpers
│   ├── auth-middleware.ts # getUser, requireRole
│   ├── email.ts           # Resend email service
│   ├── csrf.ts            # CSRF token helpers
│   └── db.ts              # PostgreSQL connection pool
└── proxy.ts               # Global middleware (JWT, session, rate‑limit)
