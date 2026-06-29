import React, { createContext, useEffect, useState } from 'react';
import { analyzeSales } from '../api';

export const RestaurantContext = createContext();

const DEFAULT_MENUS = [
  { id: 1, name: 'Pad Krapow Moo', ingredients: [{ name: 'Minced pork', amount: 100, unit: 'g' }] },
];

// per-restaurant persistence helpers (each store keeps its own data)
const loadAnalysis = (storeId) => {
  if (!storeId) return null;
  try { return JSON.parse(localStorage.getItem(`analysis_${storeId}`) || 'null'); }
  catch { return null; }
};
const loadMenus = (storeId) => {
  if (!storeId) return DEFAULT_MENUS;
  try { return JSON.parse(localStorage.getItem(`menus_${storeId}`)) || DEFAULT_MENUS; }
  catch { return DEFAULT_MENUS; }
};

export const RestaurantProvider = ({ children }) => {
  // which restaurant is currently open. All AI data below is scoped to it.
  const [storeId, setStoreId] = useState(() => localStorage.getItem('current_store') || null);

  const [menus, setMenus] = useState(() => loadMenus(storeId));
  const [analysis, setAnalysis] = useState(() => loadAnalysis(storeId));
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // sample financials (shown only as a fallback when the upload has no price column)
  const [finance] = useState({ sales: 12500, cost: 5200 });
  const [monthlyFinance] = useState([
    { month: 'Jan', sales: 45000, cost: 20000, profit: 25000 },
    { month: 'Feb', sales: 52000, cost: 22000, profit: 30000 },
    { month: 'Mar', sales: 48000, cost: 21000, profit: 27000 },
    { month: 'Apr', sales: 61000, cost: 25000, profit: 36000 },
    { month: 'May', sales: 59000, cost: 24000, profit: 35000 },
    { month: 'Jun', sales: 65000, cost: 26000, profit: 39000 },
  ]);

  // open a restaurant -> load that store's own forecast + menus
  const selectStore = (id) => {
    const sid = String(id);
    localStorage.setItem('current_store', sid);
    setStoreId(sid);
    setMenus(loadMenus(sid));
    setAnalysis(loadAnalysis(sid));
    setAnalyzeError(null);
  };

  // persist per store, so Restaurant 1 and Restaurant 2 never share data
  useEffect(() => {
    if (storeId) localStorage.setItem(`analysis_${storeId}`, JSON.stringify(analysis));
  }, [analysis, storeId]);
  useEffect(() => {
    if (storeId) localStorage.setItem(`menus_${storeId}`, JSON.stringify(menus));
  }, [menus, storeId]);

  const runAnalysis = async (file) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const configured = menus.length > 1 ? menus : null;
      const result = await analyzeSales(file, configured);
      setAnalysis(result);
      return result;
    } catch (err) {
      setAnalyzeError(err.message || String(err));
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  const addMenu = (newMenu) => setMenus([...menus, newMenu]);
  const deleteMenu = (id) => setMenus(menus.filter(menu => menu.id !== id));

  const addIngredient = (menuId, newIngredient) => {
    setMenus(menus.map(menu =>
      menu.id === menuId ? { ...menu, ingredients: [...menu.ingredients, newIngredient] } : menu
    ));
  };

  const removeIngredient = (menuId, indexToRemove) => {
    setMenus(menus.map(menu =>
      menu.id === menuId ? { ...menu, ingredients: menu.ingredients.filter((_, idx) => idx !== indexToRemove) } : menu
    ));
  };

  return (
    <RestaurantContext.Provider value={{
      storeId, selectStore,
      menus, addMenu, deleteMenu, addIngredient, removeIngredient, finance, monthlyFinance,
      analysis, analyzing, analyzeError, runAnalysis,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
