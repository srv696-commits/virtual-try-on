# Styra — Virtual Try-On Studio

An AI-powered virtual try-on web app. Upload a person photo and a clothing item, and Styra generates a realistic merged result via an n8n AI webhook. Users sign up to get one free try-on, then subscribe ($9.99/month via Stripe) for unlimited access.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icons
- **Supabase** — authentication (email/password), `profiles` table, edge function
- **Stripe** — subscription checkout via Payment Link
- **Fetch API** — native HTTP client

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
VITE_WEBHOOK_URL=https://your-n8n-instance/webhook/your-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-link
```

> **Note:** `VITE_*` variables are bundled into the client. The Supabase anon key is safe to expose — Row Level Security guards your data. The Stripe secret key must **never** be added as a `VITE_*` variable — it's stored as a Supabase edge function secret.

### 3. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Authentication

Styra uses Supabase email/password auth. Users must sign up before accessing the studio.

- **Sign up** — name, email, and password. A confirmation email is sent; the user must click the link before logging in.
- **Log in** — email and password.
- **Log out** — Logout button in the top-right navbar.
- Sessions persist across page refreshes via Supabase's built-in localStorage mechanism.

To enable email confirmation, go to **Supabase Dashboard → Authentication → Settings** and turn on **Enable email confirmations**.

## How It Works

1. User signs up and confirms their email
2. User logs in and lands on the Virtual Try-On Studio (no paywall blocking the page)
3. From **Shop the Look**, user can click any catalog image to auto-load it as the clothing item, or upload their own
4. User uploads a **person photo** (JPEG or PNG)
5. User clicks **Generate** — first generation is free for any signed-in user
6. Both images are sent as `multipart/form-data` to the n8n webhook (`image1`, `image2`)
7. The webhook returns a binary image that the app displays and allows the user to download
8. After the free try, the top banner flips to "You've used your free try-on" and a **paywall modal** opens on subsequent Generate clicks
9. User clicks **Subscribe** → Stripe Checkout → returns to the app → `verify-payment` edge function marks the user as active → unlimited generations

## Subscription & Payment

- **Price:** $9.99 / month (monthly recurring, not lifetime — make sure your Stripe product description reflects this)
- **Checkout:** Stripe Payment Link (`VITE_STRIPE_PAYMENT_LINK`). The app appends `?client_reference_id=<supabase user id>` so the edge function can match the payment to the user.
- **Return URL (important!):** In the Stripe Dashboard, set the Payment Link's **success URL** to:
  ```
  https://<your-app-domain>/?session_id={CHECKOUT_SESSION_ID}
  ```
  Keep `{CHECKOUT_SESSION_ID}` literal — Stripe substitutes it. Without this, the app never receives `session_id` after checkout and can't verify the payment, so the user appears to be stuck on the paywall.
- **Verification:** On return, the app calls the `verify-payment` Supabase edge function, which hits Stripe's API, confirms `payment_status === 'paid'`, and updates `profiles.subscription_status = 'active'`. A one-time success toast appears when verification succeeds.

## Supabase Backend

### `public.profiles` table

One row per auth user (FK → `auth.users`):
- `id` uuid PK
- `subscription_status` text — `'free'` | `'active'`
- `stripe_payment_id` text nullable
- `created_at`, `updated_at` timestamptz

RLS is enabled. An `on_profiles_updated` trigger auto-sets `updated_at`.

### Required: auto-create profile rows on signup

`verify-payment` updates `profiles.subscription_status`, so a row **must already exist** for every auth user — otherwise the update is a silent no-op and the user appears stuck on the paywall. Set this up once in the Supabase SQL Editor:

```sql
-- Backfill any users missing a profile row
INSERT INTO public.profiles (id, subscription_status)
SELECT id, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Auto-create a profile row for every future signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_status) VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### `verify-payment` edge function

- `POST /functions/v1/verify-payment`
- Requires `Authorization: Bearer <user_jwt>`
- Body: `{ session_id: "cs_..." }`
- Reads `STRIPE_SECRET_KEY` from Supabase edge function secrets (503 if not set)
- Verifies with Stripe and updates `profiles.subscription_status`

## Project Structure

```
frontend/
├── .env.local         # Local secrets — gitignored
├── .env.example       # Safe template committed to git
├── index.html         # App shell (Inter font, root div)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/
│   └── catalog/       # Shop-the-Look catalog images served at /catalog/*.png
└── src/
    ├── main.jsx       # React entry point
    ├── index.css      # Tailwind directives + base styles
    ├── supabase.js    # Supabase client singleton
    ├── AuthPage.jsx   # Login + signup forms
    └── App.jsx        # Full application (Navbar, CatalogPicker, UploadZone,
                       # ResultPanel, PaywallModal, SubscriptionBanner)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_WEBHOOK_URL` | Yes | n8n webhook endpoint that merges the two images |
| `VITE_SUPABASE_URL` | Yes | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key |
| `VITE_STRIPE_PAYMENT_LINK` | Yes | Stripe Payment Link for the monthly subscription |

## Accepted Image Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
