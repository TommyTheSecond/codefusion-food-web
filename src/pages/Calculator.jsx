import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';

// group prep_list rows ([{date, ingredient, amount, unit}]) by date
function groupByDate(prepList) {
  const byDate = {};
  (prepList || []).forEach((r) => {
    (byDate[r.date] = byDate[r.date] || []).push(r);
  });
  return byDate;
}

function fmtAmount(amount, unit) {
  if (unit === 'g' && amount >= 1000) return `${(amount / 1000).toFixed(1)} kg`;
  if (unit === 'ml' && amount >= 1000) return `${(amount / 1000).toFixed(1)} L`;
  return `${Math.round(amount)} ${unit}`;
}

function prettyDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Calculator() {
  const navigate = useNavigate();
  const { analysis, storeId } = useContext(RestaurantContext);
  const storeKey = `prep_checklist_${storeId || 'x'}`;

  const byDate = useMemo(() => groupByDate(analysis && analysis.prep_list), [analysis]);
  const dates = Object.keys(byDate).sort();
  const [activeDate, setActiveDate] = useState(null);
  const day = activeDate || dates[0];

  // which prep items the kitchen has ticked off, keyed by "date|ingredient".
  // Persisted to localStorage so the checklist survives refreshes/sessions.
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); }
    catch { return {}; }
  });
  // reload this store's checklist whenever the open restaurant changes
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(storeKey) || '{}')); }
    catch { setDone({}); }
  }, [storeKey]);
  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(done));
  }, [done, storeKey]);
  const toggle = (key) => setDone((d) => ({ ...d, [key]: !d[key] }));

  // ---- AI-driven view: real forecast-based prep amounts per day -----------
  if (analysis && dates.length > 0) {
    return (
      <div className="container">
        <div className="header-row">
          <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
          <h2>Prepare Ingredient</h2>
        </div>

        <h3 className="prepare-summary" style={{ textAlign: 'center' }}>
          Forecast-based prep for {prettyDate(day)}
        </h3>

        {/* day picker across the 7-day horizon */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '1rem 0 1.5rem' }}>
          {dates.map((d) => {
            const active = d === day;
            return (
              <button
                key={d}
                onClick={() => setActiveDate(d)}
                style={{
                  padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600,
                  borderRadius: 20, cursor: 'pointer',
                  border: active ? '1px solid #133e87' : '1px solid #c7d4e6',
                  background: active ? '#133e87' : '#fff',
                  color: active ? '#fff' : '#133e87',
                }}
              >
                {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </button>
            );
          })}
        </div>

        <div style={{
          maxWidth: 560, margin: '0 auto', background: '#fff',
          border: '1px solid #dee2e6', borderRadius: 8, padding: '0.5rem 1.25rem',
        }}>
          {byDate[day]
            .slice()
            .sort((a, b) => b.amount - a.amount)
            .map((r, idx, arr) => {
              const key = `${day}|${r.ingredient}`;
              const checked = !!done[key];
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '0.7rem 0', cursor: 'pointer',
                    color: checked ? '#9aa6b2' : '#133e87',
                    textDecoration: checked ? 'line-through' : 'none',
                    borderBottom: idx < arr.length - 1 ? '1px solid #eef1f5' : 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(key)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1 }}>{r.ingredient}</span>
                  <span style={{ fontWeight: 700 }}>{fmtAmount(r.amount, r.unit)}</span>
                </label>
              );
            })}
        </div>

        {analysis.recipe_not_set && analysis.recipe_not_set.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#777', marginTop: '1rem' }}>
            No recipe entered yet for: {analysis.recipe_not_set.join(', ')} — add one in Manage Menu
            to include it here.
          </p>
        )}
      </div>
    );
  }

  // ---- Empty state: nothing to show until a sales file is uploaded --------
  return (
    <div className="container">
      <div className="header-row">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
        <h2>Prepare Ingredient</h2>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#777', marginTop: '3rem' }}>
        Upload past sales on the Dashboard to see your prep list.
      </p>
    </div>
  );
}
