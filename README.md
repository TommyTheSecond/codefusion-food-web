# Restaurant Management Web — CodeFusion 2026 (Track 3: Sustainability)

The web frontend for a restaurant **demand-forecasting + food-waste-reduction**
tool. A restaurant uploads its past dish-sales spreadsheet; the app calls the AI
service to forecast next week's demand per dish, then turns that into a **daily
prep list**, a **weekly shopping list**, an **estimated waste/cost saving**, and
a **rule-based chatbot** you can ask about any of it.

> **AI backend (separate repo):** the forecasting + chatbot service this app
> calls — `restaurant-demand-forecasting` (FastAPI + LightGBM, no LLM, runs
> offline). This frontend talks to it over HTTP.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

The app needs the AI backend running too. By default it calls
`http://localhost:8000`. To point elsewhere, create `.env` from `.env.example`:

```
VITE_API_URL=http://localhost:8000
```

## How it works

- **Dashboard** — upload past sales (`.csv`/`.xlsx`); shows the savings estimate.
- **Manage Menu** — enter each dish's recipe (ingredient + amount). These feed the
  ingredient math; the dish names must match the names in the sales file.
- **Prepare Ingredient** — forecast-based daily prep list, with a checkbox per item.
- **Order Ingredient** — combined weekly shopping list, with checkboxes.
- **Profit Summary** — monthly figures with a month browser.
- **AI Chatbot** (floating, every page) — "what do I prep Saturday?", "how much
  shrimp this week?", "busiest day?", "how much am I saving?".

Nothing shows until a sales file is uploaded; every page falls back to a clean
empty state, so the app never looks broken.

## Deploy

Standard Vite SPA. On **Vercel** or **Netlify**: connect this repo, build command
`npm run build`, output `dist`. Both `vercel.json` and `netlify.toml` are included
with the SPA fallback (so refreshing `/dashboard` doesn't 404).

**Important:** set the environment variable **`VITE_API_URL`** to your deployed
backend URL (e.g. `https://restaurant-demand-forecasting.onrender.com`) before/at
build, or the live site will try to reach `localhost`.

## Tech

React 19 + Vite + react-router + recharts. The AI integration lives in
`src/api.js` (calls `/analyze` and `/ask`).
