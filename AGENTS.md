# AGENTS.md — AI Agent Rules for Saumya's Table

> This file is the **single source of truth** for every AI agent working on this codebase (Windsurf, Google Antigravity, Claude Opus, or any other tool).
> **Read this file before writing a single line of code. No exceptions.**

---

## 1. The Three Non-Negotiable Habits

| # | Habit | What it means |
|---|-------|---------------|
| 1 | **Maintain TODO.md** | Read `TODO.md` before every session. Mark tasks done after completing them. Add newly discovered tasks immediately. Never leave it stale. |
| 2 | **Stick to the tech stack** | Only use libraries and services listed in `TECH_STACK.md`. Do not install anything else without explicit approval recorded in this file. |
| 3 | **Keep DOCS.md updated** | After any change to schema, API routes, env vars, business logic, or deployment config — update `DOCS.md` in the same session. No deferred docs. |

---

## 2. Tech Stack Compliance

- Before running `npm install <package>`, check `TECH_STACK.md`.
- If a package is **not listed**, you must **stop** and add a note like this to the bottom of this file before proceeding:

```
## Proposed Addition — [date]
Package: <name>
Reason: <why it's needed>
Alternative considered: <what's already in the stack>
Approved: [ ] YES / [ ] NO
```

- Do **not** proceed with the installation until the `Approved: YES` box is ticked by the project owner.
- **Common traps to avoid:**
  - Do not use `axios` — use native `fetch`
  - Do not use `moment` or `dayjs` — use `date-fns` with `Intl` API for timezone
  - Do not use `NextAuth` — use Supabase Auth
  - Do not use `Prisma` — use the Supabase JS client directly
  - Do not add any payment gateway — payments are COD + Bank Transfer in v1

---

## 3. Todo Maintenance Rules

- `TODO.md` uses phases and checkboxes: `[ ]` = not started, `[x]` = done, `[~]` = in progress.
- At the **start** of every session: read `TODO.md`, find your task, mark it `[~]`.
- At the **end** of every session: mark completed items `[x]`, add any new tasks discovered under the correct phase.
- If you discover a bug, edge case, or open question while working — add it to TODO.md under `## Discovered / Backlog` immediately. Do not try to solve it in the same session unless it blocks current work.
- Never delete a task — mark it `[x]` and optionally add a note after it.

---

## 4. Documentation Rules

Update `DOCS.md` any time you:

- Add, rename, or remove a **database table or column**
- Add, change, or remove an **API route** (`/app/api/...`)
- Add or change an **environment variable**
- Change a **business rule** (cutoff logic, payment flow, delivery logic)
- Change the **deployment config** (Vercel settings, Cloudflare rules)
- Add a new **WhatsApp or email notification template**

The update must happen **in the same coding session**, not later.

---

## 5. Scope Rules — What You Must Not Build

The following are **explicitly out of scope for v1**. Do not implement them. Leave a `// TODO: v2 — <feature name>` comment at the relevant callsite only.

| Out of Scope (v1) | Why |
|---|---|
| PickMe Flash API integration | Deferred to v2. Manual tracking link entry only. |
| PayHere or any online payment gateway | Deferred to v2. COD + Bank Transfer only. |
| Sinhala / Tamil translations | Deferred to v2. |
| Subscription / recurring orders | Deferred to v2. |
| SMS notifications | Deferred to v2. Email + WhatsApp only. |
| Instagram auto-post | Deferred to v2. Uses same Meta App infrastructure as Facebook. Leave `// TODO: v2 — Instagram cross-post` at the facebook.ts callsite. |
| WhatsApp Channels auto-post | Not possible in any version yet — Meta has no public API for Channels. Leave `// TODO: v2 — WhatsApp Channel post (pending Meta API)`. |
| Native mobile app | Deferred to v2. |
| Customer ratings & reviews | Deferred to v2. |

---

## 6. Code Quality Standards

- **TypeScript strict mode** is enabled. No `any` types without a comment explaining why.
- **Server components by default.** Add `'use client'` only when you genuinely need browser APIs or React hooks.
- **Zod validation** on every form input — both client-side and in the API route handler.
- **Supabase RLS** must be in place before any feature ships. Never query Supabase with the service role key from the client.
- **All secrets** go in `.env.local` for dev and Vercel environment variables for prod. Document every new var in `DOCS.md`.
- **Error handling**: every `async` function that touches Supabase, Resend, or WhatsApp API must have a `try/catch` and return a typed error response.
- **No console.log in production code.** Use a proper logger or remove before committing.

---

## 7. Sri Lanka–Specific Rules

- All **date/time logic** must use Sri Lanka Standard Time: `Asia/Colombo` (UTC+5:30).
- The **weekly cutoff** is Thursday 7:00 PM SLST. This must be calculated server-side. Never trust the client clock for cutoff decisions.
- **Currency** is always LKR (Sri Lankan Rupees). No currency conversion. Display as `LKR 1,250.00` or `Rs. 1,250`.
- **Phone numbers** default to Sri Lanka country code `+94`. The auth phone OTP field should pre-fill `+94`.

---

## 8. File & Folder Conventions

```
/app                    → Next.js App Router pages and layouts
/app/api                → Server-side API route handlers
/app/(admin)            → Admin panel route group (protected)
/app/(auth)             → Auth route group
/components             → Shared UI components
/components/ui          → shadcn/ui components (do not edit these directly)
/lib                    → Utility functions, Supabase client, helpers
/lib/supabase           → Supabase client (server + client variants)
/lib/notifications      → Resend + WhatsApp sending functions
/hooks                  → Custom React hooks (client-side only)
/types                  → TypeScript type definitions and Zod schemas
/public                 → Static assets
```

---

## 9. Git Commit Convention

Use conventional commits:

```
feat: add bank transfer slip upload flow
fix: cutoff timer off by one hour in SLST
docs: update DOCS.md with payment_slips table
chore: update TODO.md after completing Phase 5
```

Always update `TODO.md` as part of the same commit that completes a task.

---

## Proposed Additions Log

_(AI agents: record unapproved package proposals here before installing anything not in TECH_STACK.md)_

| Date | Package | Reason | Approved |
|------|---------|--------|----------|
| — | — | — | — |
