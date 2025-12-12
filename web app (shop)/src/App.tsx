import React from 'react';
import ProductCatalog from './components/ProductCatalog';
import ShoppingCart from './components/ShoppingCart';
import { CartProvider } from './CartContext';
import './App.css';

const App: React.FC = () => {
  return (
    <CartProvider>
      <div className="app-container">
        <header>
          <h1>React E-commerce (TS & Hooks)</h1>
        </header>
        <main className="main-content">
          <ProductCatalog />
          <ShoppingCart />
        </main>
      </div>
    </CartProvider>
  );
};

export default App;
