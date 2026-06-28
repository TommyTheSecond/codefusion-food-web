import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoreSelection() {
  const navigate = useNavigate();

  const [stores, setStores] = useState(() => {
    const savedStores = localStorage.getItem('restaurant_list');
    return savedStores ? JSON.parse(savedStores) : [
      { id: 1, name: "Restaurant 1" },
      { id: 2, name: "Restaurant 2" }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  const handleSave = () => {
    if (newStoreName.trim() !== "") {
      const updatedStores = [...stores, { id: Date.now(), name: newStoreName }];
      setStores(updatedStores);
      localStorage.setItem('restaurant_list', JSON.stringify(updatedStores));
      setNewStoreName("");
      setIsAdding(false);
    }
  };

  // delete a restaurant
  const handleDeleteStore = (id, e) => {
    e.stopPropagation(); // don't navigate to Dashboard when the delete button is clicked

    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      const updatedStores = stores.filter(store => store.id !== id);
      setStores(updatedStores);
      localStorage.setItem('restaurant_list', JSON.stringify(updatedStores));
    }
  };

  return (
    <div className='container'>
      <header>
        <h1 className='title' style={{ color: '#133e87', textAlign: 'center' }}>Restaurant</h1>
      </header>

      <div className='store-grid'>
        {stores.map((store) => (
          <div 
            key={store.id} 
            className='store-card' 
            onClick={() => navigate('/dashboard')}
          >
            <h3>{store.name}</h3>
            
            {/* delete button (the × in the corner) */}
            <button 
              className="delete-store-btn"
              onClick={(e) => handleDeleteStore(store.id, e)}
            >
              ×
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className='add-store-card' style={{ padding: '1rem', cursor: 'default' }}>
            <input 
              type="text" 
              placeholder="Type your restaurant's name..."
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              autoFocus
              style={{
                width: '90%', padding: '0.5rem', marginBottom: '10px',
                borderRadius: '4px', border: '1px solid #608bc1', outline: 'none'
              }}
            />
           <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleSave}
                    style={{ padding: '0.3rem 1rem', background: '#F3f3e0', color: '#133e87', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                Save
                </button>
  
  
                    <button 
                        onClick={() => setIsAdding(false)}
                        style={{ padding: '0.3rem 1rem', background: '#F3f3e0', color: '#133e87', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                    Cancel
                </button>
            </div>
          </div>
        ) : (
          <button className='add-store-card' onClick={() => setIsAdding(true)}>
            <span className='plus-icon' style={{ fontSize: '2rem' }}>+</span>
            <p style={{ fontSize: '0.8rem' }}>Add new restaurant</p>
          </button>
        )}
      </div>
    </div>
  );
}