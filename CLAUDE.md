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

Server-side secrets (never in `VITE_*` vars — would be exposed in the browser bundle):
- `STRIPE_SECRET_KEY` → set via Supabase edge function secrets, not in any local file

Runtime guards in `supabase.js` throw immediately if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing.

## Architecture

All source is in `src/` — just four files:

- **`supabase.js`** — Supabase client singleton. Throws on missing env vars. Import `{ supabase }` from here everywhere.
- **`AuthPage.jsx`** — Standalone login/signup UI. Calls `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`. Email confirmation is enabled: after signup, `data.session` is null and a confirmation screen is shown. Accepts `onAuthSuccess(user)` prop.
- **`App.jsx`** — Everything else: `Navbar`, `UploadZone`, `ResultPanel`, and the root `App` component. All state lives here; no prop drilling beyond direct parent→child.

### Auth flow

`App` calls `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange` for the lifetime of the app. `user === null` → renders `<AuthPage>`; `user` set → renders the studio.

### Try-on flow

`UploadZone` (×2) → user uploads JPEG/PNG files → `handleGenerate` POSTs `FormData` (`image1`, `image2`) to `VITE_WEBHOOK_URL` → response is a binary image blob → `URL.createObjectURL(blob)` → `ResultPanel` displays it.

### Supabase database

`public.profiles` table (one row per auth user, FK → `auth.users`):
- `id` uuid PK
- `subscription_status` text — `'free'` | `'active'`
- `stripe_payment_id` text nullable
- `created_at`, `updated_at` timestamptz

RLS is enabled. An `on_profiles_updated` trigger auto-sets `updated_at`.

### Supabase edge function

`verify-payment` — verifies a Stripe checkout session and marks a user as paid.
- `POST /functions/v1/verify-payment`
- Requires `Authorization: Bearer <user_jwt>` header
- Body: `{ session_id: "cs_..." }`
- Reads `STRIPE_SECRET_KEY` from Supabase secrets; returns 503 if not set
- Calls `GET https://api.stripe.com/v1/checkout/sessions/{id}`, checks `payment_status === 'paid'` and `client_reference_id === user.id`, then updates `profiles.subscription_status = 'active'` using the service role key

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
