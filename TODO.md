# TODO.md — Saumya's Table

> **AI Agents:** Read this file at the start of every session. Mark tasks `[~]` when in progress, `[x]` when done. Add newly discovered tasks under `## Discovered / Backlog`. Never delete a task — only mark it done.
>
> Status key: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 1 — Supabase Schema & Seed

- [x] Write full SQL migration file — all tables (see PRD Section 6.3 + payment_slips table)
- [x] Enable Row-Level Security (RLS) on every table
- [x] Write RLS policies:
  - [x] `profiles` — user can read/write own row only
  - [x] `addresses` — user can CRUD own addresses only
  - [x] `orders` — user can read own orders; admin can read/write all
  - [x] `order_items` — readable via order ownership
  - [x] `payment_slips` — user can insert own slip; admin can read/write all
  - [x] `meals` — public read; admin write only
  - [x] `categories` — public read; admin write only
  - [x] `notifications` — admin only + user reads own order notifications
  - [x] `delivery_zones` — public read; admin write only
  - [x] `settings` — admin only + public read for safe keys (bank_account, business_profile, etc.)
- [x] Create `admin` role in Supabase and document how to assign it in DOCS.md — role is a CHECK constraint on profiles.role ('customer'|'admin'), promoted via SQL UPDATE
- [x] Write seed file: 1 admin user (promote manually after signup), 3 sample categories, 8 sample meals, 2 sample delivery zones
- [~] Test: confirm RLS blocks unauthenticated users from writing orders directly — run after migration is applied

---

## Phase 2 — Project Scaffold

- [x] `npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router, src/ off
- [x] Install and configure shadcn/ui (`npx shadcn-ui@latest init`)
- [x] Install approved dependencies: `zustand`, `react-hook-form`, `zod`, `date-fns`, `@supabase/ssr`, `@supabase/supabase-js`, `resend`, `react-email`
- [x] Set up folder structure per AGENTS.md Section 8
- [x] Configure `tsconfig.json` — strict mode on, path aliases (`@/`)
- [x] Create `.env.local` template file (`.env.example`) — list all required vars with placeholder values
- [x] Document all env vars in DOCS.md
- [x] Set up Supabase client: `/lib/supabase/server.ts` (server component client) + `/lib/supabase/client.ts` (browser client)
- [x] Set up Next.js middleware for protected routes (admin panel + authenticated pages)
- [x] Configure `next.config.js`: image domains (Supabase Storage URL), headers (security + cache)
- [x] Verify: `npm run build` passes with zero TypeScript errors

---

## Phase 3 — Authentication

- [ ] Enable Email + Phone OTP providers in Supabase Auth dashboard — (manual step, requires Supabase dashboard access)
- [x] Build Sign Up page (`/app/(auth)/signup`) — with Zod validation, react-hook-form
- [x] Build Log In page (`/app/(auth)/login`) — with redirect support
- [x] Build Phone OTP entry screen (`/app/(auth)/phone-login`) — 2-step: phone → OTP
- [x] Build Password Reset flow (`/app/(auth)/forgot-password` + `/app/(auth)/reset-password`)
- [x] Create `profiles` row on user signup via Supabase Auth trigger (database function) — done in Phase 1 migration
- [x] Build Profile page (`/app/profile`) — saved addresses, past orders, account settings with tabs
- [x] Pre-fill `+94` country code on phone input fields
- [x] Auth callback route (`/app/(auth)/callback/route.ts`) for email verification & password reset
- [x] Auth layout with branded header
- [x] Server actions for all auth flows (`/app/(auth)/actions.ts`)
- [x] Zod schemas for all auth forms (`/types/auth.ts`)
- [x] Profile server actions (`/app/profile/actions.ts`) — update profile, delete/set-default address
- [x] Build passes with zero TypeScript errors
- [ ] Test: sign up → OTP → logged in → profile row created → log out → log back in

---

## Phase 4 — About Page

- [x] Build `/app/about` page (fully static — no ISR needed, content rarely changes)
- [x] Hero section: full-width warm photo of Saumya cooking (use a warm food placeholder in dev — **DO NOT launch with a placeholder**) — placeholder in place, marked with comment
- [x] Headline: "Hi, I'm Saumya. Welcome to my table."
- [x] Story copy: use the approved first-person copy from PRD Section 3.2 **verbatim** — used verbatim
- [x] Pull quote styled component for the line: "That's how Saumya's Table was born."
- [x] Family detail badge: "Married since 1989 · Two kids in Melbourne · Cooking since before they were born"
- [x] How It Works section: reuse the 3-step component from the homepage (shared `components/how-it-works.tsx`)
- [x] Personal sign-off: circular Saumya photo placeholder + "Have a question? Message me directly." + WhatsApp CTA button
- [x] "See This Week's Menu" CTA button at page bottom linking to /menu
- [x] Add /about to main nav (between Home and Menu) and footer — Navbar + Footer components created
- [x] SEO: title = "About Saumya | Saumya's Table", description from PRD
- [x] Homepage updated with Navbar, Footer, Hero, HowItWorks, CTA
- [x] Build passes with zero TypeScript errors
- [ ] BLOCKER: Confirm real Saumya kitchen photo is ready before marking this phase complete

---

## Phase 5 — Menu Page

- [x] Build `/app/menu` page with ISR (`revalidate: 60`)
- [x] Fetch meals + categories from Supabase (server component)
- [x] Build `MealCard` component: photo (next/image), name, price (LKR), dietary tags, Add to Cart button
- [x] Build category filter pill bar (client component, URL param driven) — `components/menu-filters.tsx`
- [x] Build dietary/price filter (client component) — `DietaryFilter` in same file
- [x] Build sold-out / unavailable state on MealCard (greyed, "Not available this week" label)
- [x] Add cutoff countdown banner at top of page (see Phase 6)
- [x] Available meals sorted before unavailable meals
- [x] Build passes with zero TypeScript errors
- [ ] Test: filters work, sold-out state renders, ISR revalidates correctly

---

## Phase 6 — Cutoff Logic & Cart

- [x] Write `/lib/cutoff.ts` utility:
  - [x] `getNextCutoff()` — returns next Thursday 7:00 PM SLST as a `Date`
  - [x] `isAfterCutoff()` — returns boolean based on current SLST time
  - [x] `getDeliveryWeek()` — returns `{ deliverySat: Date, deliverySun: Date, deliveryWeekStart: Date, isNextWeek: boolean }`
  - [x] `getTimeUntilCutoff()` + `formatDeliveryDate()` helpers
  - [x] All functions use `Asia/Colombo` timezone via toLocaleString
- [x] Build `CountdownTimer` client component — updates every second, colour shifts green→yellow→red
- [x] Set up Zustand cart store (`/lib/store/cart.ts`):
  - [x] State: items, delivery day preference (sat/sun)
  - [x] Actions: addItem, removeItem, updateQty, clearCart, setDeliveryDayPreference
  - [x] getItemCount, getSubtotal computed helpers
  - [x] Persist to localStorage (client only)
  - [ ] Sync to Supabase for logged-in users — deferred, cart works via localStorage for now
- [x] Build Cart slide-up sheet (`components/cart-sheet.tsx`) — works on mobile + desktop
- [x] Cart shows delivery week banner: green ("This week: Sat DD / Sun DD") or amber ("⚠ Next week: Sat DD / Sun DD")
- [x] Cart icon with item count badge added to Navbar (desktop + mobile)
- [x] Build passes with zero TypeScript errors
- [ ] Test: place items in cart at various times relative to cutoff — correct week shown each time

---

## Phase 7 — Checkout & Order Creation

- [x] Build `/app/checkout` page — multi-step (address → payment → summary)
- [x] Step 1: Delivery address input
  - [x] Save new addresses to `addresses` table via `/api/addresses` POST route
  - [x] Allow selecting a saved address (with default highlight)
  - [ ] Google Maps Places autocomplete — requires API key, deferred to integration testing
- [x] Step 2: Payment method selection
  - [x] Card A — Cash on Delivery
  - [x] Card B — Bank Transfer (expands to show bank details from settings table)
  - [x] Bank account details pulled from `settings` table (admin-configured)
- [x] Order Reference Code generation: `ST-YYYYMMDD-XXXX` via `generate_order_reference_code` DB function
- [x] Slip upload: `/api/orders/[id]/slip` POST route + `SlipUpload` UI component on order confirmation page
- [x] WhatsApp opt-in checkbox (pre-ticked, stores to `profiles.whatsapp_opted_in`)
- [x] Step 3: Order summary with line items, delivery fee, total LKR, Place Order CTA
- [x] `/app/api/orders/create` POST route:
  - [x] Validate with Zod (`types/checkout.ts`)
  - [x] Insert `orders` + `order_items` rows
  - [x] Set `payment_status`: `pending` (COD) or `awaiting_verification` (bank transfer)
  - [x] Server-side price verification (uses DB prices, not client-submitted)
  - [x] Trigger order placed notifications (email + WhatsApp) — wired in with fire-and-forget
  - [x] Return `{ orderId, orderReferenceCode }`
- [x] Build `/app/order-confirmation/[orderId]` page with ref code copy, bank instructions, order details
- [x] Build passes with zero TypeScript errors
- [ ] Test: full checkout flow for both COD and bank transfer

---

## Phase 8 — Notifications

### Email (Resend + React Email)
- [x] Set up Resend client in `/lib/notifications/email.ts` — sendEmail() with notification logging
- [x] Build email templates in `/lib/notifications/templates.ts` (inline HTML, no React Email dep):
  - [x] `orderPlacedEmail` — order summary, delivery week, ref code + bank transfer note
  - [x] `paymentVerifiedEmail`
  - [x] `paymentRejectedEmail`
  - [x] `statusUpdateEmail` — handles confirmed, preparing, out_for_delivery, delivered, cancelled
  - [x] All templates: mobile-responsive, branded, CTA buttons
  - [x] Cutoff reminder email built inline in cron route

### WhatsApp (Meta Cloud API)
- [x] Set up WhatsApp client in `/lib/notifications/whatsapp.ts` — sendWhatsApp() with template support + notification logging
- [ ] Register and get approval for all message templates in Meta Business Manager:
  - [ ] `order_placed`
  - [ ] `bank_transfer_instructions`
  - [ ] `payment_verified`
  - [ ] `payment_rejected`
  - [ ] `order_confirmed`
  - [ ] `preparing`
  - [ ] `out_for_delivery`
  - [ ] `order_delivered`
  - [ ] `order_modified`
  - [ ] `order_cancelled`
  - [ ] `cutoff_reminder`
  - [ ] `weekly_menu_published`
- [x] Implement webhook endpoint `/api/webhooks/whatsapp` for delivery status updates (GET verify + POST status)
- [ ] Add Meta signature verification (X-Hub-Signature-256) — requires WHATSAPP_APP_SECRET env var
- [x] Save notification records to `notifications` table after every send attempt

### Notification Triggers
- [x] Order placed → email + WhatsApp to customer (wired in `/api/orders/create`)
- [x] Bank transfer slip uploaded → email to admin(s) (wired in `/api/orders/[id]/slip`)
- [x] Payment verified by admin → email + WhatsApp to customer (wired in `/api/admin/orders/[id]/verify-payment`)
- [x] Payment rejected by admin → email + WhatsApp to customer (wired in `/api/admin/orders/[id]/verify-payment`)
- [x] Order status change (confirmed/preparing/out_for_delivery/delivered/cancelled) → email + WhatsApp to customer (wired in `/api/admin/orders/[id]`)
- [x] Thursday 3:00 PM SLST automated cutoff reminder → email + WhatsApp to all opted-in customers (`/api/cron/cutoff-reminder`)
- [x] Weekly menu published (admin action) → email + WhatsApp to all customers (`/api/admin/notifications/send-menu`)
- [x] Weekly menu published (admin action) → **Facebook Page auto-post** (fires in same route)

### Facebook Auto-Post (Phase 8 addition)
- [x] Build `/lib/notifications/facebook.ts` — postToPage() + generateMenuCaption()
- [ ] Create Facebook App in Meta Business Manager (same Business Manager account as WhatsApp)
- [ ] Request `pages_manage_posts` + `pages_read_engagement` permissions
- [ ] Exchange short-lived token for long-lived Page Access Token (60-day expiry)
- [ ] Store Page Access Token in `settings` table key `facebook_integration` (server-side only, never in client)
- [ ] Build `/lib/notifications/facebook.ts` — `postToPage(photo_url, caption)` function using native fetch to Graph API v18+
- [ ] Build Facebook post caption generator: pulls this week's meal names + prices + cutoff reminder + menu link + hashtags (hashtags pulled from settings)
- [ ] Build `/app/api/admin/facebook/preview` route — returns a preview object `{ photo_url, caption, hashtags }` without posting
- [ ] Build Facebook post preview UI in the admin Publish Menu flow (shows exactly what will appear on Facebook)
- [ ] Build `/app/api/admin/facebook/post` route — fires the actual Graph API call
- [ ] Handle failure gracefully: if Graph API call fails, menu publish still succeeds, admin sees an error alert with a Retry button
- [ ] Store Facebook post status in `settings` table: `{ post_id, status: published|failed|scheduled, posted_at }`
- [ ] Build Vercel Cron Job for token expiry check: `GET /api/cron/facebook-token-check` runs weekly, emails admin alert if token expires within 7 days
- [ ] Add `FACEBOOK_PAGE_ACCESS_TOKEN` and `FACEBOOK_PAGE_ID` to env vars and document in DOCS.md
- [ ] Post scheduling: if admin publishes menu after hours (e.g. Sunday night), allow scheduling the Facebook post for Monday 9AM SLST — schedule stored in settings, Vercel Cron fires it
- [ ] Test: publish menu → Facebook post appears on Page with correct photo, caption, prices, link

---

## Phase 9 — Order Tracking Page

- [x] Build `/app/orders/[orderId]` page
- [x] Vertical timeline component: Order Placed → Confirmed → Preparing → Out for Delivery → Delivered
- [x] Active step highlighted with pulse animation
- [x] Subscribe to `orders` table changes via Supabase Realtime (client component)
- [x] Show "Your order is on its way!" when status = `out_for_delivery`
- [x] Show "Track your driver" button when `orders.tracking_link` is set
- [x] Cancelled order state with dedicated UI
- [x] Show notification history log at bottom (from `notifications` table)
- [x] Order ownership check (user owns order or is admin)
- [x] Build passes with zero TypeScript errors
- [ ] Test: update order status in Supabase dashboard → verify page updates in real-time

---

## Phase 10 — Admin Panel

All admin routes under `/app/(admin)/admin/` — protected by middleware (admin role only).

### Admin Layout
- [x] Sidebar: Dashboard, Orders, Meals, Customers, Delivery, Settings
- [x] Mobile-responsive: bottom tab bar on mobile
- [x] "View Site" link in header

### Dashboard
- [x] KPI cards: Orders this week, Revenue (LKR), Pending orders, Total customers
- [x] Recent orders list with status badges and link to detail
- [ ] Weekly order volume bar chart (use a lightweight chart lib — check TECH_STACK.md first)
- [ ] Quick action buttons: Confirm All Pending, Publish Menu, Send Cutoff Reminder
- [ ] Alert banners: unassigned orders, unverified payment slips

### Order Management
- [x] Sortable/filterable list of all orders (by status, paginated)
- [x] Detail view per order: customer info, items, address, payment status, notification log
- [x] One-tap status advancement: Placed → Confirmed → Preparing → Out for Delivery → Delivered
- [x] Cancel button
- [x] Bank Transfer orders: "Verify" / "Reject" buttons via `/api/admin/orders/[id]/verify-payment`
- [x] Tracking link input field: admin pastes URL → saved to `orders.tracking_link`
- [x] Notification log: per-order WhatsApp + email send history (from `notifications` table)
- [x] API routes: `PATCH /api/admin/orders/[id]`, `POST /api/admin/orders/[id]/verify-payment`
- [ ] Bulk actions: confirm selected, assign driver, mark delivered
- [ ] One-tap "Message on WhatsApp" button (opens `wa.me/` deep link)
- [ ] Test: advance order through all statuses, verify each triggers correct notifications

### Menu Management
- [x] CRUD for meals: name, slug, description, price, category, tags, portion info, availability toggle, stock limit, sort order
- [x] MealForm client component with Zod validation, slug auto-generation
- [x] API routes: `POST /api/admin/meals`, `PATCH /api/admin/meals/[id]`, `DELETE /api/admin/meals/[id]`
- [ ] Image upload: compress client-side → upload to Supabase Storage `/meal-images/{meal_id}`
- [ ] Bulk toggle: mark multiple meals available/unavailable
- [ ] Drag-and-drop reorder (within category)
- [ ] Category management: create, rename, reorder
- [x] "Publish This Week's Menu" button on meals page → triggers email + WhatsApp + Facebook via `/api/admin/notifications/send-menu`

### Customer Management
- [x] Customer list with order count, join date, WhatsApp opt-in badge
- [ ] Search by name, email, phone
- [ ] Customer detail: order history, addresses
- [ ] Manual order creation (phone-in orders)
- [ ] Export customer list as CSV

### Delivery Management
- [x] Delivery zones list page with fee and active status
- [x] Tracking link field on order detail (admin pastes PickMe link)
- [x] CRUD for delivery zones (name, fee, active toggle) — `/api/admin/delivery-zones` POST, PATCH, DELETE + DeliveryZonesManager client component
- [ ] Delivery assignment dropdown per order (Dad / PickMe Flash)
- [ ] Saturday vs Sunday slot capacity settings

### Settings
- [x] Bank account details (bank name, account name, account number, branch)
- [x] Business profile (name, WhatsApp number, email)
- [x] Default delivery fee
- [x] API route: `PATCH /api/admin/settings` (upsert any key)
- [ ] Facebook integration: show token expiry date, Re-connect button
- [x] Cutoff time override (extend or manually close) — datetime-local input in settings form, saved to `cutoff_override` key
- [x] Holiday mode toggle + custom message — toggle + message in settings form, saved to `holiday_mode` key
- [ ] Notification template editor
- [x] Payment methods toggle (COD on/off, Bank Transfer on/off) — checkboxes in settings form, saved to `payment_methods` key
- [x] Announcement banner (sitewide banner text) — text input in settings form, saved to `announcement_banner` key

### Build Status
- [x] Build passes with zero TypeScript errors (37 routes total)

---

## Phase 11 — Performance & Security Audit

- [x] Run `next build` — zero errors, zero TypeScript warnings (37 routes)
- [ ] Run Lighthouse on mobile for: homepage, menu, checkout, order tracking
  - [ ] Performance > 95
  - [ ] LCP < 2.0s
  - [ ] CLS < 0.05
  - [ ] FCP < 1.2s
- [ ] Run `next/bundle-analyzer` — initial JS < 150 KB
- [ ] Confirm all meal images served as WebP < 80 KB
- [x] Verify all Supabase queries use server-side client (no service role key on client) — `createServiceClient` only in route.ts + server libs
- [ ] Verify all `.env` values are set in Vercel (not just `.env.local`)
- [ ] Cloudflare: DNS → Vercel, SSL active, WAF rate-limit rules on `/api/orders` and `/api/auth`
- [x] Confirm HSTS and security headers set in `next.config.js` — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [ ] End-to-end test: COD flow (full cycle)
- [ ] End-to-end test: Bank transfer flow (full cycle including admin verification)
- [ ] End-to-end test: After-cutoff order → shows next-week delivery message
- [ ] End-to-end test: All notification triggers fire correctly

---

## Discovered / Backlog

> AI agents: add newly discovered tasks, bugs, open questions, and edge cases here during development.

- [x] Navbar shows user name + profile link when logged in, admin link for admins (async server component)
- [x] `login?redirect=` support: checkout redirects to `/login?redirect=/checkout`, login action reads redirect param
- [ ] Cart store: sync to Supabase for logged-in users (currently localStorage only)
- [ ] `/orders/[orderId]` page is 60KB first load JS due to Supabase Realtime client — consider lazy loading
- [ ] Add Meta signature verification (X-Hub-Signature-256) to WhatsApp webhook
- [ ] `formatDeliveryDate` export from cutoff.ts used in cart-sheet — verify it handles edge cases near midnight
- [x] Admin: payment verify/reject notifications wired into verify-payment route (email + WhatsApp)
- [ ] Image upload for meals not yet implemented (needs client-side compress + Supabase Storage)
- [ ] Google Maps Places autocomplete on checkout address form (requires API key setup)
- [ ] Delivery fee calculation based on delivery zone (currently hardcoded to 0)
- [ ] Guest checkout: currently redirects to login — need to decide if guest checkout stays in scope for v1
- [ ] BLOCKER: Real Saumya kitchen photo needed for About page before production launch
- [ ] IDE lint errors for `Cannot find module './xyz'` are transient — they resolve after build, not actual issues
