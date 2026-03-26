# TECH_STACK.md — Saumya's Table

> **AI Agents:** This is the **only** approved technology list for this project.
> Before running `npm install <anything>`, check this file.
> If a package is not listed here → do NOT install it → add a proposal to `AGENTS.md` first.

---

## Core Framework & Language

| Purpose | Approved | Version | Notes |
|---------|----------|---------|-------|
| Framework | **Next.js** | 14.x (App Router) | Server components by default. No Pages Router. |
| Language | **TypeScript** | 5.x | Strict mode on. No `.js` files in `/app`, `/lib`, `/components`, or `/types`. |
| Runtime | **Node.js** | 18.x+ | Vercel default. |

---

## UI & Styling

| Purpose | Approved | Notes |
|---------|----------|-------|
| CSS framework | **Tailwind CSS** | v3. Mobile-first. No inline styles for layout. |
| Component library | **shadcn/ui** | Install components via `npx shadcn-ui@latest add <component>`. Do not edit files in `/components/ui` directly — copy and extend if customisation needed. |
| Icons | **Lucide React** | Comes with shadcn/ui. Use only Lucide — no other icon libraries. |
| Fonts | **Google Fonts via `next/font`** | Plus Jakarta Sans (primary) or Nunito. Load via `next/font/google` only — no `<link>` tags. |
| Animations | **Tailwind CSS transitions + `tailwindcss-animate`** | Already included via shadcn/ui. No Framer Motion, GSAP, or other animation libraries in v1. |

---

## State Management

| Purpose | Approved | Notes |
|---------|----------|-------|
| Cart state | **Zustand** | For cart only. Keep the store small and typed. |
| Server state / data fetching | **Next.js Server Components + `use` hook** | Fetch data in server components wherever possible. No React Query, SWR, or Apollo in v1. |
| Form state | **React Hook Form** | Always paired with Zod for validation. |
| Validation | **Zod** | Use on both client (form) and server (API route). Share schema types via `/types`. |

---

## Backend & Database

| Purpose | Approved | Notes |
|---------|----------|-------|
| Database | **Supabase (PostgreSQL)** | Use the Supabase JS client directly. Do NOT use Prisma or any other ORM. |
| Auth | **Supabase Auth** | Email + Password and Phone OTP. No NextAuth, Clerk, or Auth0. |
| File storage | **Supabase Storage** | Meal images + payment slips. Auto-compress to WebP before upload where possible. |
| Realtime | **Supabase Realtime** | For order tracking page and admin dashboard only. Do not subscribe from every page. |
| Supabase client (server) | **`@supabase/ssr`** | Use for Server Components, Route Handlers, and Middleware. |
| Supabase client (browser) | **`@supabase/supabase-js`** | For Client Components only. Never use the service role key here. |
| API routes | **Next.js Route Handlers** (`/app/api/`) | Standard `fetch`-based handlers. No Express, Hono, or tRPC. |

---

## Notifications

| Purpose | Approved | Notes |
|---------|----------|-------|
| Email sending | **Resend** | Use `resend` npm package. |
| Email templating | **React Email** | Build templates as React components in `/emails/`. |
| WhatsApp (production) | **Meta WhatsApp Business Cloud API** | Direct API calls via native `fetch`. No Twilio, WATI, or MessageBird in production. |
| WhatsApp (development only) | **Twilio WhatsApp Sandbox** | Acceptable for local dev and testing. Must be swapped for Meta direct before any production deployment. |

---

## Maps & Location

| Purpose | Approved | Notes |
|---------|----------|-------|
| Address autocomplete | **Google Maps Platform — Places API** | Load via `@googlemaps/js-api-loader`. Restrict API key to your domain in Google Cloud Console. |
| Map display (order detail) | **Google Maps embed** | Simple `<iframe>` embed for showing delivery address. No full Maps JS SDK needed on the customer side. |
| Geocoding | **Google Maps Geocoding API** | For converting address to lat/lng when saving to `addresses` table. |

> ❌ Do NOT use: Mapbox, Leaflet, OpenStreetMap, or any other map library.

---

## Date & Time

| Purpose | Approved | Notes |
|---------|----------|-------|
| Date manipulation | **date-fns** | For formatting, comparisons, and arithmetic. |
| Timezone handling | **`Intl.DateTimeFormat` (built-in JS)** | For converting to/from `Asia/Colombo` (UTC+5:30). No moment.js. No dayjs. |

> All cutoff and delivery date logic must run server-side. Never trust `new Date()` from a client browser for business rules.

---

## Deployment & Infrastructure

| Purpose | Approved | Notes |
|---------|----------|-------|
| Hosting | **Vercel** | Hobby tier (free). Connect to GitHub for auto-deploys. |
| CDN & Security | **Cloudflare (Free)** | DNS proxy over Vercel. WAF rules. No paid Cloudflare features needed in v1. |
| Environment variables | **Vercel Environment Variables** | Set in Vercel dashboard for Preview and Production. Local dev uses `.env.local`. |
| Cron jobs | **Vercel Cron Jobs** | For Thursday 3PM SLST cutoff reminder. Defined in `vercel.json`. |

---

## Social Media Integration

| Purpose | Approved | Notes |
|---------|----------|-------|
| Facebook auto-post | **Facebook Graph API v18+** | Direct API calls via native `fetch`. Post photos + caption + link to the Facebook Page when menu is published. No third-party SDK needed. |
| Instagram (v2 only) | **Facebook Graph API (Instagram Basic Display)** | Uses the same Meta App infrastructure. Deferred to v2. Leave a `// TODO: v2 — Instagram cross-post` comment. |
| WhatsApp Channels | **Not available** | Meta has no stable public API for Channels. Manual only. Deferred to v2. |

> Facebook token: use a **long-lived Page Access Token** (exchange short-lived → long-lived via `/oauth/access_token?grant_type=fb_exchange_token`). Store in `settings` table (server-side, never in client). Token expires ~60 days — Vercel Cron checks expiry and emails admin alert 7 days before.

> ❌ Do NOT use: `facebook-node-sdk`, `fb`, or any unofficial Facebook wrapper packages. Use native `fetch` directly against `https://graph.facebook.com/v18.0/`.

---

## Analytics & Monitoring

| Purpose | Approved | Notes |
|---------|----------|-------|
| Web analytics | **Vercel Analytics** | Enable in Vercel dashboard. Add `<Analytics />` to root layout. |
| Privacy-friendly analytics | **Umami** (optional) | Self-hosted on a free tier (Railway/Vercel). No Google Analytics in v1. |
| Error monitoring | **Vercel Logs** | Free tier sufficient for v1. No Sentry in v1. |

---

## Payments (v1 Only)

| Method | Implementation | Notes |
|--------|---------------|-------|
| Cash on Delivery | No third-party needed | Order status set to `pending` until admin marks paid. |
| Bank Transfer | Manual — admin verifies slip | Customer uploads slip photo to Supabase Storage. Order Reference Code used for matching. |

> ❌ **DO NOT integrate any payment gateway in v1.** PayHere, Stripe, PayPal are all deferred to v2.
> Leave a `// TODO: v2 — PayHere integration` comment in the checkout payment method selector.

---

## Utility Libraries

| Purpose | Approved | Notes |
|---------|----------|-------|
| Class merging | **`clsx` + `tailwind-merge`** | Comes with shadcn/ui setup. Use `cn()` helper from `/lib/utils.ts`. |
| HTTP client | **Native `fetch`** (built into Node 18+ and browsers) | No axios, got, ky, or superagent. |
| Image compression (client) | **`browser-image-compression`** | For compressing payment slip photos before upload. Approved for this specific use case only. |
| CSV export | **`papaparse`** | For admin customer list export only. |

---

## Explicitly Banned Libraries

The following are **banned** — do not install these under any circumstances:

| Banned | Use Instead |
|--------|-------------|
| `axios` | Native `fetch` |
| `moment` | `date-fns` + `Intl` |
| `dayjs` | `date-fns` + `Intl` |
| `next-auth` | Supabase Auth |
| `@auth/nextjs` | Supabase Auth |
| `prisma` | Supabase JS client |
| `@prisma/client` | Supabase JS client |
| `styled-components` | Tailwind CSS |
| `@emotion/react` | Tailwind CSS |
| `@chakra-ui/react` | shadcn/ui |
| `@mui/material` | shadcn/ui |
| `framer-motion` | Tailwind `animate` |
| `react-query` | Next.js Server Components |
| `swr` | Next.js Server Components |
| `redux` | Zustand |
| `react-redux` | Zustand |
| `@reduxjs/toolkit` | Zustand |
| `firebase` | Supabase |
| `twilio` (production) | Meta WhatsApp Cloud API |
| `stripe` | Deferred to v2 |
| `@payhere/sdk` | Deferred to v2 |

---

## Version Pinning Notes

- Keep all Supabase packages on the same minor version (`@supabase/ssr` and `@supabase/supabase-js` must match).
- Do not upgrade Next.js to 15.x until explicitly approved — breaking changes in Server Actions.
- Pin `react` and `react-dom` to 18.x.

---

_Last updated: project initialisation. AI agents must update this file's "Last updated" line whenever a new package is added after approval via AGENTS.md._
