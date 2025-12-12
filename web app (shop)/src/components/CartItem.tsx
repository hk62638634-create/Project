import React, { useCallback } from 'react';
import { CartItem as TCartItem, useCart } from '../CartContext';

interface CartItemProps {
  item: TCartItem;
}

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const itemTotal = item.price * item.quantity;

  const handleUpdateQuantity = useCallback((delta: number) => {
    const newQuantity = item.quantity + delta;
    updateQuantity(item.id, newQuantity);
  }, [item.id, item.quantity, updateQuantity]);

  const handleRemove = useCallback(() => {
    removeFromCart(item.id);
  }, [item.id, removeFromCart]);

  return (
    <div className="cart-item">
      <div className="item-info">
        <h4>{item.title}</h4>
        <p className="item-price-unit">Unit Price: {formatPrice(item.price)}</p>
      </div>
      <div className="item-controls">
        <div className="quantity-control">
          <button onClick={() => handleUpdateQuantity(-1)} disabled={item.quantity <= 1}>
            -
          </button>
          <span className="item-quantity">{item.quantity}</span>
          <button onClick={() => handleUpdateQuantity(1)}>+</button>
        </div>
        <div className="item-total-price">
          <p>Subtotal: <strong>{formatPrice(itemTotal)}</strong></p>
          </div>
        <button className="remove-btn" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
