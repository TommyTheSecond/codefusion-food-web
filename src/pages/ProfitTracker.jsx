import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';
// chart components from recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProfitTracker() {
  const navigate = useNavigate();
  // daily + monthly figures
  const { monthlyFinance, analysis } = useContext(RestaurantContext);

  // Real monthly figures computed from the uploaded sales (present only when the
  // file had a price column); otherwise fall back to the sample data.
  const real = analysis && analysis.monthly_finance && analysis.monthly_finance.length
    ? analysis.monthly_finance : null;
  const months = real || monthlyFinance;
  const isReal = !!real;

  // which month is being viewed (default: most recent). Lets you step back in time.
  const [monthIdx, setMonthIdx] = useState(months.length ? months.length - 1 : 0);

  // nothing to show until a sales file has been imported
  if (!analysis) {
    return (
      <div className="container">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
        <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#777', marginTop: '3rem' }}>
          Upload past sales on the Dashboard to see your profit summary.
        </p>
      </div>
    );
  }

  const idx = Math.min(monthIdx, months.length - 1);
  const selected = months[idx] || { month: '-', sales: 0, cost: 0, profit: 0 };
  const canPrev = idx > 0;
  const canNext = idx < months.length - 1;
  const navBtn = (enabled) => ({
    background: enabled ? '#133e87' : '#c7d4e6', color: '#fff', border: 'none',
    borderRadius: '50%', width: 36, height: 36, fontSize: '1.1rem',
    cursor: enabled ? 'pointer' : 'default',
  });

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Profit Summary</h2>
        {/* month browser: step back/forward through the months on record */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={navBtn(canPrev)} disabled={!canPrev}
                  onClick={() => canPrev && setMonthIdx(idx - 1)}>‹</button>
          <span style={{ background: '#133e87', color: 'white', padding: '0.5rem 1.25rem',
                         borderRadius: '50px', fontWeight: 600, minWidth: 64, textAlign: 'center' }}>
            📅 {selected.month}
          </span>
          <button style={navBtn(canNext)} disabled={!canNext}
                  onClick={() => canNext && setMonthIdx(idx + 1)}>›</button>
        </div>
      </div>

      {/* 1. selected-month summary (top) */}
      <div className="profit-box" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Sales ({selected.month})</h4>
          <h2 style={{ margin: 0, color: '#333' }}>THB {selected.sales.toLocaleString()}</h2>
        </div>
        <div>
          <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Cost</h4>
          <h2 style={{ margin: 0, color: 'red' }}>THB {selected.cost.toLocaleString()}</h2>
        </div>
        <div>
          <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Profit</h4>
          <h2 style={{ margin: 0, color: 'green' }}>THB {selected.profit.toLocaleString()}</h2>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginTop: '0.75rem' }}>
        {isReal
          ? 'Computed from your uploaded sales: revenue = price × quantity; cost estimated from recipes.'
          : 'ℹ️ Profit figures are sample data — add a price column to your sales file to see real revenue & profit.'}
      </p>

      <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />

      {/* 2. monthly summary + chart (bottom) */}
      <h3>Overall Performance</h3>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* chart */}
        <div style={{ flex: '2', minWidth: '400px', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Sales / Cost / Profit Graph</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `THB ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="#ff7300" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#28a745" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* monthly numbers table */}
        <div style={{ flex: '1', minWidth: '250px', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Profit Per Month Summary</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Month</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Profit (THB)</th>
              </tr>
            </thead>
            <tbody>
              {months.map((data, index) => (
                <tr
                  key={index}
                  onClick={() => setMonthIdx(index)}
                  style={{
                    borderBottom: '1px solid #eee', cursor: 'pointer',
                    background: index === idx ? '#eef3fb' : 'transparent',
                  }}
                >
                  <td style={{ padding: '8px', fontWeight: index === idx ? 700 : 400 }}>{data.month}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: 'green', fontWeight: 'bold' }}>
                    {data.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}