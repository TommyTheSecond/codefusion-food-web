// src/api.js
// Thin client for the AI backend (the Python FastAPI service in
// restaurant-demand-forecasting). All AI calls go through here so the rest of
// the app never hard-codes a URL.
//
// The base URL comes from VITE_API_URL at build time; falls back to localhost
// for local dev. Set it in a .env file (see .env.example) or in your host's
// env vars when deploying:
//     VITE_API_URL=https://your-api.onrender.com

export const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

// The website's menus look like:
//   { id, name, ingredients: [{ name, amount, unit }] }
// The backend's analyze() wants recipes as:
//   { "<dish name>": [["<ingredient>", <per_serving>, "<unit>"], ...] }
export function menusToRecipes(menus) {
  const recipes = {};
  (menus || []).forEach((m) => {
    if (!m || !m.name) return;
    recipes[m.name] = (m.ingredients || []).map((ing) => [
      ing.name,
      Number(ing.amount) || 0,
      ing.unit || 'g',
    ]);
  });
  return recipes;
}

// Upload a sales spreadsheet (+ the restaurant's menus as recipes) and get the
// full forecast/prep/shopping/savings result dict back.
export async function analyzeSales(file, menus, { overprepRate = 0.3 } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('overprep_rate', String(overprepRate));
  const recipes = menusToRecipes(menus);
  if (Object.keys(recipes).length > 0) {
    form.append('recipes', JSON.stringify(recipes));
  }

  const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: form });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json()).detail || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return res.json();
}

// Ask the rule-based chatbot a question about an analysis result.
export async function askBot(question, result) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, result }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json()).detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()).answer;
}

// Liveness check (used to show "backend offline" hints).
export async function ping() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
