# DOCS.md — Saumya's Table Technical Documentation

> **AI Agents:** Update this file in the **same session** as any change to schema, API routes, env vars, business logic, or deployment config. Do not defer documentation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Environment Variables](#2-environment-variables)
3. [Database Schema](#3-database-schema)
4. [Business Logic](#4-business-logic)
5. [API Routes](#5-api-routes)
6. [Notification System](#6-notification-system)
7. [Admin Panel](#7-admin-panel)
8. [Deployment](#8-deployment)
9. [Changelog](#9-changelog)

---

## 1. Project Overview

**Saumya's Table** is a weekly home-cooked meal prep delivery service run by Saumya, a passionate home cook based in Sri Lanka. Saumya prepares nutritious, traditional Sri Lankan meals every week — rooted in recipes passed down from her own mother — and delivers them on Saturday or Sunday to busy individuals and families who want real home cooking without the time it takes to make it.

**The person behind it:** Saumya has been cooking for her family for over three decades. Her two children (both married and living in Melbourne, Australia) grew up on her food. After they moved abroad, she channelled her love of feeding people into Saumya's Table, helping working families in Sri Lanka eat well every week. She has been married since 1989.

**Key business rule:** Orders must be placed before **Thursday 7:00 PM Sri Lanka Standard Time (SLST / UTC+5:30)**. Orders placed after the cutoff are automatically queued for the following week's delivery.

**Tech stack summary:** Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Resend · Meta WhatsApp Cloud API · Vercel · Cloudflare

Full stack reference: see `TECH_STACK.md`.

---

## 2. Environment Variables

> Every new env var must be added to this section immediately. Also add to `.env.example` with a placeholder value.

| Variable | Used In | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL. Safe to expose (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key. Safe to expose (public, RLS enforces security). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key. **Never expose to client.** Used only in Route Handlers and server utilities. |
| `RESEND_API_KEY` | Server only | Resend API key for sending transactional emails. |
| `RESEND_FROM_EMAIL` | Server only | Sender email address e.g. `orders@saumyastable.lk` |
| `WHATSAPP_ACCESS_TOKEN` | Server only | Meta WhatsApp Cloud API access token. |
| `WHATSAPP_PHONE_NUMBER_ID` | Server only | The phone number ID from Meta Business Manager. |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Server only | Custom token for verifying Meta webhook callbacks. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client | Google Maps JS API key. Restrict to your domain in Google Cloud Console. |
| `CRON_SECRET` | Server only | Secret used to authenticate Vercel Cron Job requests to `/api/cron/cutoff-reminder`. |
| `FACEBOOK_PAGE_ID` | Server only | The numeric ID of Saumya's Table Facebook Page. Found in Facebook Page settings. |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Server only | Long-lived Page Access Token (valid ~60 days). Exchange via `/oauth/access_token?grant_type=fb_exchange_token`. Store here AND in `settings.facebook_integration.token` (DB is source of truth for rotation). |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | Base URL for auth redirects. `http://localhost:3000` in dev, `https://saumyastable.lk` in prod. |

---

## 3. Database Schema

All tables are in the `public` schema in Supabase (PostgreSQL). RLS is enabled on all tables.

### `profiles`
Extends Supabase Auth users. Created automatically via a database trigger on `auth.users` insert.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | `uuid` PK | FK → `auth.users.id` |
| `name` | `text` | Customer display name |
| `phone` | `text` | With country code e.g. `+94771234567` |
| `email` | `text` | Copied from auth |
| `role` | `text` | `customer` (default) or `admin` |
| `whatsapp_opted_in` | `boolean` | Default `true`. Set at checkout. |
| `created_at` | `timestamptz` | Auto |

### `addresses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `user_id` | `uuid` | FK → `profiles.user_id` |
| `label` | `text` | e.g. "Home", "Office" |
| `street` | `text` | Full street address |
| `city` | `text` | |
| `district` | `text` | Sri Lanka district |
| `lat` | `float8` | From Google Geocoding |
| `lng` | `float8` | From Google Geocoding |
| `is_default` | `boolean` | Default `false` |
| `created_at` | `timestamptz` | Auto |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `name` | `text` | e.g. "Rice Meals", "Short Eats" |
| `sort_order` | `int` | Admin-controlled display order |

### `meals`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `name` | `text` | |
| `slug` | `text` | URL-safe, unique |
| `description` | `text` | |
| `price_lkr` | `numeric(10,2)` | In LKR |
| `category_id` | `uuid` | FK → `categories.id` |
| `image_url` | `text` | Supabase Storage URL |
| `tags` | `text[]` | e.g. `["vegan", "gluten-free"]` |
| `portion_info` | `text` | e.g. "Serves 1, ~450g" |
| `is_available` | `boolean` | Weekly availability toggle |
| `stock_limit` | `int` | Max orders this week. `null` = unlimited |
| `sort_order` | `int` | Within category |
| `created_at` | `timestamptz` | Auto |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `user_id` | `uuid` | FK → `profiles.user_id`. Nullable for guest orders. |
| `guest_email` | `text` | For guest checkout. Null if logged-in user. |
| `guest_phone` | `text` | For guest checkout. |
| `status` | `text` | Enum: `placed`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled` |
| `payment_method` | `text` | `cod` or `bank_transfer` |
| `payment_status` | `text` | `pending`, `awaiting_verification`, `verified`, `rejected` |
| `order_reference_code` | `text` | Unique. Format: `ST-YYYYMMDD-XXXX`. Server-generated. |
| `delivery_week_start` | `date` | Monday of the target delivery week |
| `delivery_date_preference` | `text` | `saturday` or `sunday` |
| `delivery_partner` | `text` | `dad` or `pickme_flash`. Nullable until assigned. |
| `tracking_link` | `text` | Manually entered PickMe tracking URL. Nullable. |
| `address_id` | `uuid` | FK → `addresses.id` |
| `delivery_fee_lkr` | `numeric(10,2)` | At time of order |
| `total_lkr` | `numeric(10,2)` | Items + delivery fee |
| `notes` | `text` | Customer special instructions |
| `created_at` | `timestamptz` | Auto. Used for cutoff determination. |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `order_id` | `uuid` | FK → `orders.id` |
| `meal_id` | `uuid` | FK → `meals.id` |
| `quantity` | `int` | |
| `unit_price_lkr` | `numeric(10,2)` | Snapshot of price at order time |

### `payment_slips`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `order_id` | `uuid` | FK → `orders.id` |
| `image_url` | `text` | Supabase Storage path |
| `uploaded_at` | `timestamptz` | Auto |
| `verified_by` | `uuid` | FK → `profiles.user_id` (admin). Nullable until actioned. |
| `verified_at` | `timestamptz` | Nullable |
| `rejection_reason` | `text` | Nullable. Set if admin rejects. |

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `order_id` | `uuid` | FK → `orders.id` |
| `channel` | `text` | `email` or `whatsapp` |
| `type` | `text` | e.g. `order_placed`, `payment_verified`, `out_for_delivery` |
| `recipient` | `text` | Email address or WhatsApp number |
| `status` | `text` | `sent`, `delivered`, `read`, `failed` |
| `error_message` | `text` | Nullable. Populated on failure. |
| `sent_at` | `timestamptz` | Auto |

### `delivery_zones`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto |
| `name` | `text` | e.g. "Colombo 3", "Nugegoda" |
| `fee_lkr` | `numeric(10,2)` | Delivery fee for this zone |
| `partner` | `text` | `dad`, `pickme_flash`, or `any` |

### `settings`
Key-value store for all admin-configurable settings.

| Key | Value shape | Description |
|-----|-------------|-------------|
| `business_profile` | `{ name, logo_url, tagline, phone, whatsapp, address, email }` | Business info |
| `bank_account` | `{ account_name, bank_name, branch, account_number, reference_prefix }` | Bank transfer details |
| `cutoff_override` | `{ enabled: bool, custom_cutoff_iso: string \| null, closed: bool }` | Manual cutoff control |
| `holiday_mode` | `{ enabled: bool, message: string }` | Pause ordering |
| `delivery_slots` | `{ saturday_capacity: int, sunday_capacity: int }` | Weekly slot limits |
| `payment_methods` | `{ cod_enabled: bool, bank_transfer_enabled: bool }` | Enable/disable methods |
| `announcement_banner` | `{ enabled: bool, text: string, colour: string }` | Sitewide banner |
| `facebook_integration` | `{ enabled: bool, page_id: string, token: string, token_expiry: string, hashtags: string[], post_schedule_time: string\|null, last_post_id: string\|null, last_post_status: string }` | Facebook Page integration config |
| `seo` | `{ [page]: { title, description, og_image_url } }` | Per-page SEO |

---

## 4. Business Logic

### Cutoff & Delivery Week Calculation

Location: `/lib/cutoff.ts`

**Rules:**
- Cutoff is every **Thursday at 7:00 PM SLST** (`Asia/Colombo`, UTC+5:30).
- If current time is **before** the cutoff: delivery is the **coming Saturday and Sunday**.
- If current time is **at or after** the cutoff: delivery is the **Saturday and Sunday of the following week**.
- All calculations are done **server-side**. The client only receives the pre-calculated delivery dates and a boolean `isNextWeek`.

**Key functions:**
- `getNextCutoff(): Date` — returns the next Thursday 7:00 PM SLST as a UTC Date object.
- `isAfterCutoff(): boolean` — compares `new Date()` (UTC) to the result of `getNextCutoff()`.
- `getDeliveryWeek(): { deliverySat: Date, deliverySun: Date, isNextWeek: boolean }` — returns the target delivery weekend.

### Order Reference Code Generation

Location: `/app/api/orders/create` route handler (server-side only).

Format: `ST-YYYYMMDD-XXXX` where:
- `YYYYMMDD` = the delivery week start date (Monday) in SLST.
- `XXXX` = a zero-padded 4-digit sequence number, incremented per order for that week.

Example: `ST-20250310-0042`

The reference code is stored in `orders.order_reference_code` and must be:
1. Shown prominently on the order confirmation page.
2. Included in the order placed email and WhatsApp message.
3. Displayed next to the bank account details so customers know what to write in their transfer reference.

### Bank Transfer Flow

1. Customer selects Bank Transfer at checkout.
2. Server generates `order_reference_code`.
3. Bank account details are fetched from `settings.bank_account`.
4. Customer is shown: bank name, account number, account name, and their unique reference code.
5. Customer completes the transfer via their own banking app, using the reference code as the payment description.
6. Customer uploads a photo of the payment slip on the order confirmation page (or directly in checkout).
7. Slip is uploaded to Supabase Storage at path `payment-slips/{order_id}/{timestamp}.webp`.
8. `payment_slips` row is inserted. `orders.payment_status` remains `awaiting_verification`.
9. Admin receives a WhatsApp message and email notifying them of the new slip.
10. Admin views slip in the admin panel, cross-references the reference code, and taps Verify or Reject.
11. Customer receives WhatsApp + email notification of the outcome.

---

## 5. API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/about` | Public | Static About page. Saumya's story, inspiration, family background. Fully static — no data fetching. |
| `POST` | `/api/addresses` | Authenticated | Save a new delivery address for the logged-in user. |
| `POST` | `/api/orders/create` | Optional (guest or logged-in) | Creates a new order. Generates reference code. Triggers notifications. |
| `POST` | `/api/orders/[id]/slip` | Order owner | Uploads a payment slip for a bank transfer order. |
| `PATCH` | `/api/admin/orders/[id]` | Admin | Update order status, tracking link. Zod validated. |
| `POST` | `/api/admin/orders/[id]/verify-payment` | Admin | Verify or reject a bank transfer payment. Updates payment_slips status. |
| `POST` | `/api/admin/meals` | Admin | Create a new meal with full Zod validation. |
| `PATCH` | `/api/admin/meals/[id]` | Admin | Update meal details or availability. |
| `DELETE` | `/api/admin/meals/[id]` | Admin | Delete a meal. |
| `PATCH` | `/api/admin/settings` | Admin | Upsert any settings key-value pair. |
| `GET` | `/api/webhooks/whatsapp` | Meta | Webhook verification endpoint (hub.challenge handshake). |
| `POST` | `/api/webhooks/whatsapp` | Meta (verified) | Receives delivery status updates from Meta WhatsApp API. |
| `GET` | `/api/cron/cutoff-reminder` | Vercel Cron (secret) | Sends Thursday 3PM cutoff reminder to all opted-in customers. |
| `POST` | `/api/admin/notifications/send-menu` | Admin | Sends weekly menu notification: email + WhatsApp to all customers + Facebook Page auto-post. |
| `GET` | `/api/admin/facebook/preview` | Admin | Returns preview object `{ photo_url, caption, hashtags }` for admin to review before publishing. |
| `POST` | `/api/admin/facebook/post` | Admin | Posts to the Facebook Page via Graph API. Called automatically on menu publish, or manually via retry. |
| `GET` | `/api/cron/facebook-token-check` | Vercel Cron | Weekly check — emails admin if Page Access Token expires within 7 days. |

> Update this table whenever a new route is added or an existing one changes signature.

---

## 6. Notification System

### Trigger Map

| Event | Email | WhatsApp (customer) | WhatsApp (admin) | Facebook Page |
|-------|-------|---------------------|------------------|---------------|
|-------|-------|---------------------|------------------|
| Order placed (COD) | ✅ | ✅ | ❌ |
| Order placed (bank transfer) | ✅ | ✅ (with bank details + ref code) | ❌ |
| Payment slip uploaded | ❌ | ❌ | ✅ |
| Payment verified | ✅ | ✅ | ❌ |
| Payment rejected | ✅ | ✅ | ❌ |
| Order confirmed | ✅ | ✅ | ❌ |
| Preparing | ❌ | ✅ | ❌ |
| Out for delivery | ✅ | ✅ | ❌ |
| Delivered | ✅ | ✅ | ❌ |
| Order modified | ✅ | ✅ | ❌ |
| Order cancelled | ✅ | ✅ | ❌ |
| Cutoff reminder (Thu 3PM cron) | ✅ | ✅ | ❌ |
| Weekly menu published | ❌ | ✅ (opted-in only) | ❌ |

### Facebook Page Auto-Post

Location: `/lib/notifications/facebook.ts`

**Trigger:** Admin publishes weekly menu → `/api/admin/facebook/post` is called server-side.

**Post contents:**
- Photo: the `image_url` of the first featured meal (or admin-selected meal) from Supabase Storage
- Caption: generated from this week's available meals — name, short description, price (LKR) for each
- Cutoff reminder line: "Order by Thursday 7PM for weekend delivery →"
- Menu link: `https://saumyastable.lk/menu`
- Hashtags: pulled from `settings.facebook_integration.hashtags` (admin-editable)

**Token management:**
- Token stored in `settings` table key `facebook_integration.token` (server-side)
- Also stored in `FACEBOOK_PAGE_ACCESS_TOKEN` env var as fallback
- Vercel Cron `GET /api/cron/facebook-token-check` runs every Monday 8AM SLST
- If token expires within 7 days: sends email to admin via Resend with a direct link to the Re-connect Facebook page in admin Settings

**Scheduling:**
- Default: post immediately on menu publish
- Optional: admin sets a `post_schedule_time` in Settings (e.g. Monday 9:00 AM SLST)
- If scheduled: post details stored in `settings.facebook_integration.scheduled_post`, Vercel Cron fires at the scheduled time
- Vercel Free plan: 2 cron jobs max — cutoff reminder uses 1, Facebook token check uses 1 (the actual post can be triggered from the menu publish cron or a one-time scheduled call; consider upgrading to Vercel Pro if more crons needed)

### Sending Functions

Location: `/lib/notifications/`

- `sendEmail(type, recipient, data)` — wraps Resend. Logs result to `notifications` table.
- `sendWhatsApp(type, recipient, data)` — wraps Meta Cloud API. Logs result to `notifications` table.
- Both functions are fire-and-forget (do not block order creation). Use `Promise.all` where possible.
- Both functions catch errors and write a `failed` record to `notifications` table — they never throw.

---

## 7. Admin Panel

### Access Control

Admin routes are under `/app/(admin)/`. The Next.js middleware (`/middleware.ts`) checks that:
1. The user is authenticated (Supabase session exists).
2. Their `profiles.role` is `admin`.

If either check fails, the user is redirected to `/login`.

### How to Assign Admin Role

The `profiles.role` column defaults to `'customer'`. To promote a user to admin:

1. The user must first sign up through the app (this creates their `auth.users` row and triggers a `profiles` row).
2. Run the following SQL in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

Replace with the actual admin email. The `role` column has a CHECK constraint: only `'customer'` or `'admin'` are valid.

### Admin WhatsApp Number

Saumya's WhatsApp number is stored in `settings.business_profile.whatsapp`. It receives:
- Payment slip uploaded alerts.
- Any future admin-directed notification types.

---

## 8. Deployment

### Services

| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Hosting + Cron Jobs | `saumyastable.lk` (custom domain) |
| Cloudflare | DNS proxy + WAF | Proxies Vercel origin |
| Supabase | DB + Auth + Storage | Supabase dashboard |
| Resend | Email delivery | resend.com dashboard |
| Meta Business | WhatsApp API | business.facebook.com |
| Google Cloud | Maps API | console.cloud.google.com |

### Vercel Cron Jobs

Defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cutoff-reminder",
      "schedule": "30 13 * * 4"
    }
  ]
}
```

> `30 13 * * 4` = 13:30 UTC every Thursday = 7:00 PM SLST (UTC+5:30). This fires the cutoff reminder 4 hours before cutoff.

> Note: Vercel Free plan supports 2 cron jobs maximum. This uses 1.

### Cloudflare WAF Rules

Rate limit rules (set in Cloudflare dashboard):
- `/api/orders/create` — max 10 requests per IP per minute.
- `/api/auth/*` — max 5 requests per IP per minute.
- All other `/api/*` — max 30 requests per IP per minute.

---

## 9. Changelog

> AI agents: prepend a new entry here whenever a significant change is made to the codebase.

| Date | Change | Author |
|------|--------|--------|
| 2025-03-26 | Additional features: `/orders` page (user order history), My Orders link in Navbar, admin send-menu API (`/api/admin/notifications/send-menu`) with email+WhatsApp+Facebook blast, slip-uploaded admin notification. 35 routes, build passes. | Cascade |
| 2025-03-26 | Backlog fixes + Phase 11 partial: Auth-aware Navbar (async server component, user name + admin link), login redirect support, payment verify/reject notifications wired. Security audit: HSTS + headers verified, `createServiceClient` only in server routes/libs. 33 routes, build passes. | Cascade |
| 2025-03-26 | Phase 8 wiring: Email templates (`/lib/notifications/templates.ts`), notification triggers wired into `/api/orders/create` and `/api/admin/orders/[id]`. Payment slip upload route + UI. Cutoff reminder cron. WhatsApp webhook. 33 routes total, build passes. | Cascade |
| 2025-03-26 | Phase 10: Admin Panel — dashboard (KPI cards, recent orders), order management (list/detail/status/payment verify), meals CRUD, customer list, delivery zones list, settings (bank account/business profile/delivery fee). Admin layout with sidebar + mobile nav. 6 admin API routes. 25 routes total, build passes. | Cascade |
| 2025-03-26 | Phase 9: Order Tracking page with Supabase Realtime timeline, notification history, ownership check. | Cascade |
| 2025-03-26 | Phase 8 scaffold: Notification functions — email.ts (Resend), whatsapp.ts (Meta Cloud API), facebook.ts (Graph API postToPage + caption generator). | Cascade |
| 2025-03-26 | Phase 7: Checkout multi-step flow (address/payment/summary), `/api/orders/create` POST route with Zod validation + server-side price verification, `/api/addresses` POST route, order confirmation page with ref code copy + bank transfer instructions. | Cascade |
| 2025-03-26 | Phase 5+6: Menu page with ISR, MealCard, CategoryFilter, DietaryFilter, CountdownTimer (green→yellow→red), Zustand cart store with localStorage, CartSheet with delivery week banner, Navbar cart icon. `/lib/cutoff.ts` utility. | Cascade |
| 2025-03-26 | Phase 4: About page with PRD verbatim copy, HowItWorks shared component, Navbar + Footer, Homepage with hero/CTA. | Cascade |
| 2025-03-26 | Phase 3: Authentication — Sign Up, Log In, Phone OTP, Forgot/Reset Password pages with Zod validation + react-hook-form. Auth callback route. Profile page with tabs (account/addresses/orders). Server actions for all auth flows. Auth layout. `NEXT_PUBLIC_SITE_URL` env var added. | Cascade |
| 2025-03-26 | Phase 2: Project scaffold verified complete — all deps installed, shadcn/ui configured, Supabase clients, middleware, next.config.js headers, tsconfig strict. Build passes. | Cascade |
| 2025-03-26 | Phase 1: Full SQL migration (`001_initial_schema.sql`) — all 10 tables, RLS on all tables, storage buckets (payment-slips, meal-images), storage RLS, triggers (auto-create profile, settings timestamp), helper functions (is_admin, is_order_owner, generate_order_reference_code), default settings seed, Realtime enabled on orders. Seed file with 3 categories, 8 meals, 2 delivery zones. | Cascade |
| Project init | Initial documentation created from PRD v1.0 | — |
