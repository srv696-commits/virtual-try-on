# Styra — Virtual Try-On Studio

An AI-powered virtual try-on web app. Upload a person photo and a clothing item, and Styra generates a realistic merged result via an n8n AI webhook. Users must create an account and log in to access the studio.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icons
- **Supabase** — authentication (email/password)
- **Fetch API** — native HTTP client

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
VITE_WEBHOOK_URL=https://your-n8n-instance/webhook/your-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note:** `VITE_*` variables are bundled into the client. The Supabase anon key is safe to expose — Row Level Security guards your data. If you need to keep the webhook URL private, add a backend proxy.

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

Styra uses Supabase email/password auth. Users must sign up before accessing the try-on studio.

- **Sign up** — name, email, and password. A confirmation email is sent; the user must click the link before logging in.
- **Log in** — email and password.
- **Log out** — Logout button in the top-right navbar.
- Sessions persist across page refreshes via Supabase's built-in localStorage mechanism.

To enable email confirmation, go to **Supabase Dashboard → Authentication → Settings** and turn on **Enable email confirmations**.

## How It Works

1. User signs up and confirms their email
2. User logs in and lands on the Virtual Try-On Studio
3. User uploads a **person photo** (JPEG or PNG)
4. User uploads a **clothing / item photo** (JPEG or PNG)
5. Both images are sent as `multipart/form-data` to the n8n webhook (`image1`, `image2`)
6. The webhook returns a binary image file
7. The app converts the response blob to a local URL via `URL.createObjectURL()` and displays the result
8. User can download the generated image

## Project Structure

```
frontend/
├── .env               # Local secrets — gitignored
├── .env.example       # Safe template committed to git
├── index.html         # App shell (Inter font, root div)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx       # React entry point
    ├── index.css      # Tailwind directives + base styles
    ├── supabase.js    # Supabase client singleton
    ├── AuthPage.jsx   # Login + signup forms
    └── App.jsx        # Full application (Navbar, UploadZone, ResultPanel)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_WEBHOOK_URL` | Yes | n8n webhook endpoint that merges the two images |
| `VITE_SUPABASE_URL` | Yes | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key |

## Accepted Image Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
