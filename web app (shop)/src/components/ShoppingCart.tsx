import React from 'react';
import { useCart } from '../CartContext';
import CartItem from './CartItem';
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};
const ShoppingCart: React.FC = () => {
  const { cart, totalAmount, resetCart } = useCart();
  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      resetCart();
    }
  };
  return (
    <div className="shopping-cart-container">
      <h2>🛒 Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty. Go ahead and add some products!</p>
      ) : (
        <>
          <div className="cart-item-list">
            {cart.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Total: <span className="total-amount">{formatPrice(totalAmount)}</span></h3>
            <button className="reset-btn" onClick={handleReset}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default ShoppingCart;
