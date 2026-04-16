# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Styra is a React + Vite single-page app styled after a Myntra-style ecommerce platform. Supabase email/password authentication gates the entire app. The core feature is AI virtual try-on: the user uploads two images, the app POSTs them to an n8n webhook, and displays the generated result image.

## Commands

```bash
npm run dev        # Start dev server (port 5173, or next free port)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

No test runner is configured.

## Environment Variables

Secrets live in `.env.local` (gitignored by Vite's `*.local` rule). `.env.example` is the committed template with empty values.

| Variable | Where | Purpose |
|---|---|---|
| `VITE_WEBHOOK_URL` | `.env.local` | n8n webhook endpoint for AI image merging |
| `VITE_SUPABASE_URL` | `.env.local` | Supabase project API URL (public) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Supabase publishable key (public) |
| `VITE_STRIPE_PAYMENT_LINK` | `.env.local` | Stripe payment link URL for subscription checkout |

Server-side secrets (never in `VITE_*` vars — would be exposed in the browser bundle):
- `STRIPE_SECRET_KEY` → set via Supabase edge function secrets, not in any local file

Runtime guards in `supabase.js` throw immediately if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing.

## Architecture

All source is in `src/` — just four files:

- **`supabase.js`** — Supabase client singleton. Throws on missing env vars. Import `{ supabase }` from here everywhere.
- **`AuthPage.jsx`** — Standalone auth UI with four modes: `login`, `signup`, `forgot` (send reset email), and a `resetMode` prop-driven screen (set new password). Email confirmation is enabled: after signup, `data.session` is null and a confirmation screen is shown. Props: `onAuthSuccess(user)`, `resetMode` (bool), `onPasswordReset(newPassword)`.
- **`App.jsx`** — Everything else: `Navbar`, `CatalogPicker`, `UploadZone`, `ResultPanel`, `PaywallModal`, `SubscriptionBanner`, and the root `App` component. All state lives here; no prop drilling beyond direct parent→child.

Static catalog images for the "Shop the Look" feature live in `public/catalog/item-{1..4}.png` and are served at `/catalog/*.png`.

### Auth flow

`App` calls `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange` for the lifetime of the app. `user === null || isResettingPassword` → renders `<AuthPage>`; otherwise renders the studio or paywall.

**Password reset:** `onAuthStateChange` fires `PASSWORD_RECOVERY` when a user clicks a reset link. App sets `isResettingPassword = true`, renders `<AuthPage resetMode>`. User submits new password → `supabase.auth.updateUser({ password })` → `isResettingPassword` cleared → `SIGNED_IN` event fires normally.

**Email sending:** Supabase is configured with Resend as the custom SMTP provider. If auth emails stop working, check Supabase Dashboard → Project Settings → Authentication → SMTP Settings.

### Try-on flow

`UploadZone` (×2) → user uploads JPEG/PNG files → `handleGenerate` POSTs `FormData` (`image1`, `image2`) to `VITE_WEBHOOK_URL` → response is a binary image blob → `URL.createObjectURL(blob)` → `ResultPanel` displays it.

**Catalog shortcut:** `CatalogPicker` renders the `CATALOG` array. Clicking an item calls `urlToFile(src)` (fetch → blob → `File`) and sets it as `file2`, so the user only needs to upload the person photo. The selected item gets a pink ring.

### Paywall flow

The studio is **not** gated at login — all signed-in users see the full UI. Gating happens at `handleGenerate`:

- Free users get **one free generation** per user id. A flag is persisted in `localStorage` under `styra:free-try-used:<user.id>` and mirrored to `freeTryUsed` state.
- When `subscription_status !== 'active'` and `freeTryUsed === true`, `handleGenerate` opens `<PaywallModal>` instead of calling the webhook.
- On a successful generation by a non-subscribed user, the flag is set so the next click shows the modal.
- `<SubscriptionBanner>` sits below the navbar for non-subscribed users and switches copy based on `freeTryUsed`.
- Active subscribers get no banner, no modal, unlimited generations.

**Post-payment return:** the `session_id` effect invokes `verify-payment`, then refetches the profile. If the first refetch still reads `'free'` (DB propagation race), it retries once after 1 s. On success, a toast is shown and `showPaywall` is cleared. On failure, `paymentError` is surfaced inside the modal so the user can retry without losing context.

### Supabase database

`public.profiles` table (one row per auth user, FK → `auth.users`):
- `id` uuid PK
- `subscription_status` text — `'free'` | `'active'`
- `stripe_payment_id` text nullable
- `created_at`, `updated_at` timestamptz

RLS is enabled. An `on_profiles_updated` trigger auto-sets `updated_at`.

**Required invariant:** every auth user must have a corresponding `profiles` row. An `on_auth_user_created` trigger inserts `{id, subscription_status: 'free'}` on every signup. Without it, `verify-payment` updates zero rows (silent no-op) and paid users get stuck on the paywall — the setup SQL is in README.md. Frontend uses `.maybeSingle()` on profile reads so a missing row returns `null` cleanly rather than 406.

### Supabase edge function

`verify-payment` — verifies a Stripe checkout session and marks a user as paid.
- `POST /functions/v1/verify-payment`
- Requires `Authorization: Bearer <user_jwt>` header
- Body: `{ session_id: "cs_..." }`
- Reads `STRIPE_SECRET_KEY` from Supabase secrets; returns 503 if not set
- Calls `GET https://api.stripe.com/v1/checkout/sessions/{id}`, checks `payment_status === 'paid'` and `client_reference_id === user.id`, then updates `profiles.subscription_status = 'active'` using the service role key

**Stripe Payment Link setup (required):** the Payment Link's **success URL** in the Stripe Dashboard must be `https://<app-domain>/?session_id={CHECKOUT_SESSION_ID}` (keep the placeholder literal). Without this, the app never sees `session_id` after checkout and `verify-payment` never fires — users appear stuck on the paywall. Also make sure the Stripe product name/description does not claim "lifetime" — Styra is a monthly subscription.

## Style Guide

- Theme: white background (`#fafafa`), Myntra-pink accent (`#ff3f6c`), gray borders
- Font: Inter via Google Fonts in `index.html`
- Tailwind only — no custom CSS beyond `src/index.css` base reset
- No dark mode

## Constraints

- No router — intentionally a single page
- No global state library (Redux, Zustand) — `App` state is sufficient for this scope
- Images: JPEG and PNG only
- Don't remove runtime env var guards in `supabase.js`
