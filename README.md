# Aurora

Aurora is a Nuxt 3 application for tracking your mood, writing encrypted diary entries and analysing the data with generative AI.  
It uses Supabase as a backend, OpenAI for chat features and Spotify to pull your top tracks.

## Features
- **Encrypted Notes & Mood Entries** – Data is encrypted in the browser using AES‑GCM. The key encryption key is derived from your password with scrypt and stored only in session storage.
- **Mood Tracker** – Record daily moods with optional detailed emotions, social and location context.
- **Diary** – Write personal notes that remain private thanks to client‑side encryption.
- **Analytics Dashboard** – Visualise average moods over time and generate summaries via ChatGPT.
- **Chat With Your Data** – Query your mood history or favourite songs using an AI chat interface.
- **Spotify Integration** – Connect your account to view top tracks/artists and even get a playful roast of your taste.

## Getting Started
### Prerequisites
- Node.js 20+
- A Supabase project with the database schema from [`types/database.types.ts`](types/database.types.ts)
- OpenAI and Spotify API credentials

### Installation
```bash
# install dependencies
npm install
```
Create an `.env` file (or set environment variables) with at least:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development
Start a hot‑reload dev server:
```bash
npm run dev
```
Visit `http://localhost:3000` to use the app.

### Production
Build and preview the production bundle:
```bash
npm run build
npm run preview
```

## Encryption Overview
Aurora never sends plaintext content to the server. When you create a note or mood entry:
1. A unique **content encryption key (DEK)** is generated with `AES‑GCM`.
2. The DEK is wrapped using a key derived from your password with `scrypt` (the **KEK**).
3. Only the ciphertext, IV and salt are stored in Supabase. Keys live in session storage and memory only.

This ensures that your private data stays private even if the backend is compromised.

---
Inspired by the Nuxt minimal starter.
