import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';

import StoreSelection from './pages/StoreSelection';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import Calculator from './pages/Calculator';
import OrderSheet from './pages/OrderSheet';
import ProfitTracker from './pages/ProfitTracker';
import FloatingChatbot from './components/FloatingChatbot'; // import the chatbot
import './App.css';

function App() {
  return (
    <RestaurantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StoreSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/order" element={<OrderSheet />} />
          <Route path="/profit" element={<ProfitTracker />} />
        </Routes>
        
        {/* keep the chatbot floating on every page */}
        <FloatingChatbot />
        
      </BrowserRouter>
    </RestaurantProvider>
  );
}

export default App;