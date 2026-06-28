import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';

// sub-component for each menu card
function MenuCard({ menu }) {
  const { deleteMenu, addIngredient, removeIngredient } = useContext(RestaurantContext);
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!ingName || !ingAmount) return;
    
    // add the new ingredient
    addIngredient(menu.id, { name: ingName, amount: Number(ingAmount), unit: 'g' });
    setIngName(''); // clear the inputs
    setIngAmount('');
  };

  return (
    <div className="menu-item-card relative-card">
      <button className="delete-btn" onClick={() => deleteMenu(menu.id)}>-</button>
      <h3>{menu.name}</h3>
      
      {/* ingredient list */}
      <ul className="ingredient-list">
        {menu.ingredients.map((ing, idx) => (
          <li key={idx}>
            {ing.name} : {ing.amount} {ing.unit}
            <button className="del-ing-btn" onClick={() => removeIngredient(menu.id, idx)}>x</button>
          </li>
        ))}
      </ul>

      {/* add-ingredient form */}
      <form onSubmit={handleAddIngredient} className="ingredient-form">
        <input 
          type="text" 
          placeholder="Ingredient" 
          value={ingName} 
          onChange={(e) => setIngName(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="g" 
          value={ingAmount} 
          onChange={(e) => setIngAmount(e.target.value)} 
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
}

// main menu-management page
export default function MenuManager() {
  const navigate = useNavigate();
  const { menus, addMenu } = useContext(RestaurantContext);
  const [newMenuName, setNewMenuName] = useState('');

  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenuName) return;
    addMenu({
      id: Date.now(),
      name: newMenuName,
      ingredients: [] // start with an empty array
    });
    setNewMenuName('');
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">← back</button>
      <h2>Menu and Ingredient Manager</h2>
      
      <form onSubmit={handleAddMenu} className="form-group">
        <input 
          type="text" 
          value={newMenuName} 
          onChange={(e) => setNewMenuName(e.target.value)} 
          placeholder="type your new menu here...." 
        />
        <button type="submit">Create Menu</button>
      </form>

      <div className="store-grid">
        {menus.map(menu => (
          <MenuCard key={menu.id} menu={menu} />
        ))}
      </div>
    </div>
  );
}