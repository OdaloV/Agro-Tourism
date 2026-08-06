#  HarvestHost

> Connecting visitors with authentic farm experiences across Kenya.

HarvestHost is a full-stack agritourism platform where farmers list activities and manage bookings, visitors discover farms and pay via M-Pesa, and admins verify farms and oversee the platform. It includes escrow payments, automated payouts, in-app messaging, Google Calendar sync, and two-factor authentication.

**Live Demo:** [https://aagritourism-d3cq40x80-victoria-s-projects14.vercel.app/](https://aagritourism-d3cq40x80-victoria-s-projects14.vercel.app/)


---

##  Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Admin Setup](#admin-setup)
- [User Roles](#user-roles)
- [Payment Flow](#payment-flow)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

##  Features

###  For Farmers
| Feature | Description |
|---------|-------------|
| **Farm Profile** | Manage description, photos, facilities, and location |
| **Activity Management** | List activities with price, duration, and capacity |
| **Schedule View** | Calendar view of all bookings |
| **Booking Management** | Approve, reject, or mark bookings as completed |
| **Automated Payouts** | Receive 90% of booking value via bank transfer (10% platform fee) |
| **Bank Details** | Manage payout account information |
| **Message Visitors** | Respond to inquiries and reviews |
| **Analytics Dashboard** | View earnings, booking trends, and farm performance |

###  For Visitors
| Feature | Description |
|---------|-------------|
| **Browse Farms** | Search, filter, and explore farms by location, activity type, or price |
| **Book Activities** | Real-time availability with instant confirmation |
| **M-Pesa Payments** | Secure STK push payments via IntaSend |
| **Email Notifications** | Booking confirmations and reminders |
| **Reviews & Ratings** | Rate farms after completed visits |
| **In-App Chat** | Direct messaging with farmers |
| **Booking History** | Track all past and upcoming bookings |
| **Request Refund** | Eligible bookings can be refunded |

###  For Admin
| Feature | Description |
|---------|-------------|
| **Farm Verification** | Review and approve farmer profiles and documents |
| **Platform Stats** | Monitor bookings, revenue, and pending verifications |
| **System Management** | Manage all users, farms, and bookings |
| **Refund Processing** | Handle dispute resolutions and refunds |

###  Security
| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure, httpOnly cookie-based sessions |
| **Single Session Per User** | New login invalidates previous sessions |
| **Role-Based Access** | Visitor, farmer, and admin roles with strict permissions |
| **Two-Factor Authentication** | Email OTP for enhanced account security |
| **Hidden Admin Login** | Secret-query-param-protected admin access URL |
| **CSRF Protection** | Tokens for all state-changing requests |
| **Rate Limiting** | Brute-force protection via Upstash Redis |
| **Input Validation** | SQL injection prevention via parameterised queries |

---

##  Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, RSC) |
| **Language** | TypeScript |
| **Database** | PostgreSQL 16 (connection pooling via `pg`) |
| **Authentication** | JWT (`jose`) + httpOnly cookies |
| **Styling** | Tailwind CSS + Framer Motion |
| **Payments** | IntaSend API (M-Pesa STK push, bank payouts, refunds) |
| **Email** | Resend (transactional emails, OTP delivery) |
| **SMS** | Africa's Talking (optional booking notifications) |
| **Calendar** | Google Calendar API (farm schedule sync) |
| **Cache / Rate Limit** | Upstash Redis |
| **Deployment** | Vercel |

---

##  Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── admin/              # Stats, verifications, farm management
│   │   ├── auth/               # Login, register, 2FA, logout, password reset
│   │   ├── bookings/           # Booking CRUD and refunds
│   │   ├── farmer/             # Profile, schedule, earnings, activities
│   │   ├── marketplace/        # Farm product listings
│   │   ├── payments/           # Initiate, release, webhook, refund
│   │   └── messages/           # Chat conversations
│   ├── admin/                  # Admin dashboard pages
│   ├── farmer/                 # Farmer dashboard pages
│   ├── visitor/                # Visitor dashboard pages
│   ├── auth/                   # Login, register, 2FA, password reset pages
│   ├── farms/                  # Public farm listing and detail pages
│   ├── marketplace/            # Product listing and detail pages
│   ├── setup/                  # One-time admin account creation
│   └── marketing/              # Public landing page
├── components/
│   ├── admin/                  # Admin-specific components
│   ├── auth/                   # AuthCard wrapper
│   ├── layout/                 # Header, Footer, BottomNav
│   ├── sections/               # Hero, FeaturedFarms
│   └── ui/                     # Button, Card, Badge, Skeleton, etc.
├── lib/
│   ├── auth-middleware.ts       # getUser(), requireRole() helpers
│   ├── db/index.ts             # PostgreSQL connection pool
│   ├── email.ts                # Resend email service
│   ├── csrf.ts                 # CSRF token generation and validation
│   ├── redis.ts                # Upstash Redis client
│   ├── intasend.ts             # IntaSend payment client
│   ├── mpesa.ts                # M-Pesa STK push helpers
│   ├── sms.ts                  # Africa's Talking SMS helpers
│   └── google-calendar.ts      # Google Calendar API helpers
├── proxy.ts                    # Legacy middleware (see middleware.ts)
└── middleware.ts               # Active Next.js middleware (JWT, redirects)
```

---

##  Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/harvesthost.git
cd harvesthost

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in all values — see Environment Variables section below

# 4. Create the database
createdb harvesthostdb

# 5. Run schema migrations
psql -d harvesthostdb -f database/schema.sql

# 6. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

##  Environment Variables

Create a `.env.local` file in the project root. All variables below are required unless marked optional.

```env
# Database 
DATABASE_URL=postgresql://user:password@localhost:5432/harvesthostdb

#  JWT 
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-key

# Email (Resend) 
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev   # or your verified domain

# IntaSend Payments
INTASEND_PUBLISHABLE_KEY=ISPubKey_test_xxxx
INTASEND_SECRET_KEY=ISSecretKey_test_xxxx
INTASEND_ENVIRONMENT=sandbox              # or: live

# M-Pesa (handled via IntaSend — fill only if using direct Daraja) 
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/mpesa/callback


# Google Calendar 
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin 
# Generate with: openssl rand -base64 32
ADMIN_SECRET=your-admin-secret
NEXT_PUBLIC_ADMIN_SECRET=your-admin-secret   # must match ADMIN_SECRET

# Cron Jobs 
# Generate with: openssl rand -base64 32
CRON_SECRET=your-cron-secret

# App URLs 
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

##  Database Setup

HarvestHost uses PostgreSQL directly via the `pg` connection pool — **not** Supabase Auth. If you use Supabase as a hosted Postgres provider, connect via `DATABASE_URL` only and ignore Supabase's own auth system entirely.

```bash
# Create the database
createdb harvesthostdb

# Apply the schema
psql -d harvesthostdb -f database/schema.sql
```

Key tables:

| Table | Purpose |
|-------|---------|
| `users` | All users (visitors, farmers, admins) |
| `farmer_profiles` | Extended farm details |
| `farmer_activities` | Activities offered per farm |
| `farmer_facilities` | Facilities per farm |
| `farmer_documents` | Verification document URLs |
| `bookings` | All bookings |
| `payments` | Payment records and escrow state |
| `messages` | In-app chat |
| `reviews` | Farm reviews and ratings |

---

##  Admin Setup

Admin access is a two-step process:

### Step 1 — Create the admin account (one-time only)

Visit `/setup` on your deployed instance or locally:

```
http://localhost:3000/setup
```

Fill in your name, email, phone, and password. This route is locked after the first admin is created — subsequent attempts return `403 Admin already configured`.

### Step 2 — Log in via the secret URL

The admin login page is hidden behind a secret query parameter to prevent discovery:

```
http://localhost:3000/auth/login/admin?secret=YOUR_ADMIN_SECRET
```

Replace `YOUR_ADMIN_SECRET` with the value of `ADMIN_SECRET` in your `.env.local`. Visiting the URL without the correct secret redirects to `/404`.

> **Security note:** Keep the admin URL private. Do not share it in public channels. Rotate `ADMIN_SECRET` with `openssl rand -base64 32` if it is ever exposed, and update the value on Vercel:
> ```bash
> npx vercel env rm ADMIN_SECRET
> npx vercel env add ADMIN_SECRET
> ```

---

##  User Roles

| Role | Registration | Login URL |
|------|-------------|-----------|
| **Visitor** | `/auth/register/visitor` | `/auth/login/visitor` |
| **Farmer** | `/auth/register/farmer` | `/auth/login/farmer` |
| **Admin** | `/setup` (one-time) | `/auth/login/admin?secret=YOUR_ADMIN_SECRET` |

### Farmer verification flow

1. Farmer registers and completes the multi-step form (farm details, activities, facilities, media).
2. Farmer uploads verification documents at `/farmer/verification` (National ID, business license, ownership proof, selfie).
3. Admin reviews documents at `/admin/dashboard` and approves or rejects.
4. On approval, the farm becomes visible to visitors and bookings open.

---

## Payment Flow

HarvestHost uses **IntaSend** for all money movement:

```
Visitor pays (M-Pesa STK push)
        ↓
  Payment held in escrow
        ↓
  Booking completed
        ↓
  90% released to farmer (bank transfer)
  10% retained as platform fee
        ↓
  Farmer receives payout
```

- **Sandbox testing:** set `INTASEND_ENVIRONMENT=sandbox` and use IntaSend's test credentials.
- **Refunds:** handled via `/api/payments/refund` — eligible within the platform's refund window.
- **Webhooks:** IntaSend posts payment status updates to `/api/payments/webhook`.

---

