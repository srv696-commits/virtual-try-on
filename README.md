# Styra — Virtual Try-On Studio

An AI-powered virtual try-on web app. Upload a person photo and a clothing item, and Styra generates a realistic merged result via an n8n AI webhook.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icons
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

Open `.env` and fill in your webhook URL:

```env
VITE_WEBHOOK_URL=https://your-n8n-instance/webhook/your-id
```

> **Note:** `VITE_*` variables are bundled into the client. If you need to keep the webhook URL private from end users, add a backend proxy.

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

## How It Works

1. User uploads a **person photo** (JPEG or PNG)
2. User uploads a **clothing / item photo** (JPEG or PNG)
3. Both images are sent as `multipart/form-data` to the n8n webhook (`image1`, `image2`)
4. The webhook returns a binary image file
5. The app converts the response blob to a local URL via `URL.createObjectURL()` and displays the result
6. User can download the generated image

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
    └── App.jsx        # Full application (Navbar, UploadZone, ResultPanel)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_WEBHOOK_URL` | Yes | n8n webhook endpoint that merges the two images |

## Accepted Image Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
