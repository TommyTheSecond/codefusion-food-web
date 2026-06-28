import React, { createContext, useState } from 'react';
import { analyzeSales } from '../api';

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [menus, setMenus] = useState([
    {
      id: 1,
      name: 'Pad Krapow Moo',
      ingredients: [{ name: 'Minced pork', amount: 100, unit: 'g' }]
    }
  ]);

  // daily figures
  const [finance, setFinance] = useState({
    sales: 12500,
    cost: 5200,
  });

  // monthly figures (6-month sample)
  const [monthlyFinance, setMonthlyFinance] = useState([
    { month: 'Jan', sales: 45000, cost: 20000, profit: 25000 },
    { month: 'Feb', sales: 52000, cost: 22000, profit: 30000 },
    { month: 'Mar', sales: 48000, cost: 21000, profit: 27000 },
    { month: 'Apr', sales: 61000, cost: 25000, profit: 36000 },
    { month: 'May', sales: 59000, cost: 24000, profit: 35000 },
    { month: 'Jun', sales: 65000, cost: 26000, profit: 39000 },
  ]);

  // ---- AI forecast result (from the Python backend) -----------------------
  // null until a sales file is uploaded and analyzed. Every AI-driven page
  // reads from here; pages fall back to static content when it's null.
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // Upload a sales spreadsheet -> forecast + prep/shopping lists + savings.
  // Sends the restaurant's current menus as recipes so ingredient breakdowns
  // line up with what they entered in MenuManager.
  const runAnalysis = async (file) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      // Only override the backend's recipes once the restaurant has actually
      // set up its own menu (more than the single starter placeholder). That
      // keeps a first-time upload working out of the box, while real menus take
      // over as soon as they're entered in Manage Menu.
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
      menus, addMenu, deleteMenu, addIngredient, removeIngredient, finance, monthlyFinance,
      analysis, analyzing, analyzeError, runAnalysis,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
