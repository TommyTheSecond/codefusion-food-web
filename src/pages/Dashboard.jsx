import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { finance, analysis, analyzing, analyzeError, runAnalysis } =
    useContext(RestaurantContext);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      await runAnalysis(file);
    } catch {
      /* error is surfaced via analyzeError below */
    } finally {
      e.target.value = ''; // allow re-uploading the same file
    }
  };

  const savings = analysis && analysis.savings;

  return (
    <div className="container">
      <div className='header-row'>
        <button onClick={() => navigate('/')} className='back-btn'>← back</button>
        <h2 className='title'>Restaurant Management System</h2>
      </div>

      {/* Upload past sales -> AI forecast powers Prepare / Order / Chatbot */}
      <div className="upload-row" style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <button
          className="menu-btn"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={analyzing}
          style={{ maxWidth: 360, margin: '0 auto' }}
        >
          {analyzing ? 'Analyzing sales…' : '⬆️ Upload past sales (.csv / .xlsx)'}
        </button>
        {analyzeError && (
          <p style={{ color: '#b00020', fontSize: '0.85rem' }}>
            Couldn’t analyze: {analyzeError}
          </p>
        )}
        {analysis && !analyzing && (
          <p style={{ color: '#133e87', fontSize: '0.85rem' }}>
            ✅ Forecast ready for {analysis.forecast?.length || 0} dish-days
            {' '}({analysis.date_range?.[0]} → {analysis.date_range?.[1]} history).
            Open Prepare / Order to see it.
          </p>
        )}
      </div>

      <div className="menu-grid">
        <button className="menu-btn" onClick={() => navigate('/menu')}>Add/Manage Menu</button>
        <button className="menu-btn" onClick={() => navigate('/calculator')}>Prepare Ingredient</button>
        <button className="menu-btn" onClick={() => navigate('/order')}>Order Ingredient</button>
        <button className="menu-btn" onClick={() => navigate('/profit')}>Profit Summary</button>
      </div>

      {analysis && (
        <div className="profit-summary-small">
          <p>Today's sales: THB {finance.sales} <span style={{ fontSize: '0.75rem', color: '#999' }}>(sample)</span></p>
          <p>profit: THB {finance.sales - finance.cost} <span style={{ fontSize: '0.75rem', color: '#999' }}>(sample)</span></p>
          {savings && (
            <p style={{ color: '#1a7f37' }}>
              ♻️ Est. waste avoided next week: {savings.kg_saved} kg
              {' '}(~THB {Math.round(savings.baht_saved)}, {savings.servings_saved} servings)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
