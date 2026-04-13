# CLAUDE.md — Styra Virtual Try-On Studio

Guidelines for Claude Code when working in this repository.

## Project Overview

Styra is a React + Vite single-page app styled after a Myntra-style ecommerce platform. Its sole feature is an AI virtual try-on: the user uploads two images, the app POSTs them to an n8n webhook, and displays the generated result.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

## Architecture

Everything lives in `src/App.jsx` — one file, no routing, no state management library.

Key components (all in `App.jsx`):
- `Navbar` — ecommerce-style top nav (Styra branding, category links, search, icons)
- `UploadZone` — drag-and-drop + click-to-browse image uploader (accepts JPEG/PNG only)
- `ResultPanel` — three states: empty placeholder, loading skeleton, result image + download
- `App` (root) — holds all state, orchestrates the API call

## API Integration

- Endpoint lives in `VITE_WEBHOOK_URL` (`.env`) — never hardcode it in source
- Method: `POST multipart/form-data`
- Form keys: `image1` (person), `image2` (clothing)
- Response: binary image blob → `URL.createObjectURL(blob)`

## Environment Variables

All secrets and URLs must live in `.env` (gitignored). Use `.env.example` as the committed template.

| Variable | Purpose |
|---|---|
| `VITE_WEBHOOK_URL` | n8n webhook for AI image merging |

A runtime guard in `App.jsx` throws immediately if `VITE_WEBHOOK_URL` is undefined — don't remove it.

## Style Guide

- Theme: white background (`#fafafa`), Myntra-pink accent (`#ff3f6c`), gray borders
- Font: Inter (loaded via Google Fonts in `index.html`)
- Tailwind only — no custom CSS beyond `src/index.css` base reset
- No dark mode — this is a light-theme ecommerce UI

## Security Rules

- Never commit `.env` — it is gitignored
- Never hardcode the webhook URL or any API key in source files
- Add new secrets to `.env.example` (with empty value) so collaborators know they exist
- If adding a new external service, evaluate whether it needs a backend proxy to hide credentials from the browser bundle

## What to Avoid

- Don't add a router — this is intentionally a single page
- Don't introduce a global state library (Redux, Zustand) for this scope
- Don't accept image formats beyond JPEG and PNG without explicit request
- Don't remove the `VITE_WEBHOOK_URL` runtime guard
