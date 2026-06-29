import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';

function fmtAmount(amount, unit) {
  if (unit === 'g' && amount >= 1000) return `${(amount / 1000).toFixed(1)} kg`;
  if (unit === 'ml' && amount >= 1000) return `${(amount / 1000).toFixed(1)} L`;
  return `${Math.round(amount)} ${unit}`;
}

export default function OrderSheet() {
  const navigate = useNavigate();
  const { analysis } = useContext(RestaurantContext);

  // which shopping items are bought, keyed by ingredient. Persisted so the
  // checklist survives refreshes/sessions.
  const [bought, setBought] = useState(() => {
    try { return JSON.parse(localStorage.getItem('order_checklist') || '{}'); }
    catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem('order_checklist', JSON.stringify(bought));
  }, [bought]);
  const toggle = (key) => setBought((b) => ({ ...b, [key]: !b[key] }));

  // ---- AI-driven view: one weekly shopping list, ingredients summed -------
  if (analysis && analysis.shopping_list && analysis.shopping_list.length > 0) {
    const list = analysis.shopping_list
      .slice()
      .sort((a, b) => b.weekly_total - a.weekly_total);
    return (
      <div className="container">
        <div className="header-row">
          <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
          <h2>Order Ingredient</h2>
        </div>

        <h3 className="prepare-summary" style={{ textAlign: 'center' }}>
          Shopping list for next week (all dishes combined)
        </h3>

        <div style={{
          maxWidth: 560, margin: '1rem auto 0', background: '#fff',
          border: '1px solid #dee2e6', borderRadius: 8, padding: '0.5rem 1.25rem',
        }}>
          {list.map((row, idx) => {
            const checked = !!bought[row.ingredient];
            return (
              <label
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '0.7rem 0', cursor: 'pointer',
                  color: checked ? '#9aa6b2' : '#133e87',
                  textDecoration: checked ? 'line-through' : 'none',
                  borderBottom: idx < list.length - 1 ? '1px solid #eef1f5' : 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(row.ingredient)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                <span style={{ flex: 1 }}>{row.ingredient}</span>
                <span style={{ fontWeight: 700 }}>{fmtAmount(row.weekly_total, row.unit)}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Empty state: nothing to show until a sales file is uploaded --------
  return (
    <div className="container">
      <div className="header-row">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
        <h2>Order Ingredient</h2>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#777', marginTop: '3rem' }}>
        Upload past sales on the Dashboard to see your weekly shopping list.
      </p>
    </div>
  );
}
