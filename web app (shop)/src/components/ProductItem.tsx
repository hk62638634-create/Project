import React, { useCallback, useState } from 'react';
import { Item } from '../core'; // 导入 Item 类型
import { useCart } from '../CartContext';

interface ProductItemProps {
  product: Item; // 使用 Item 类型
}

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { addToCart, isItemInCart } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);

  const isInCart = isItemInCart(product.id);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
    setFeedback(isInCart ? '✅ Quantity Increased!' : '🛒 Added to Cart!');

    // Clear feedback message after 1.5 seconds
    setTimeout(() => setFeedback(null), 1500);
  }, [addToCart, product, isInCart]);

  return (
    <div className="product-item">
      <h3>{product.title}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">
        <strong>Price: {formatPrice(product.price)}</strong>
      </p>
      <button
        onClick={handleAddToCart}
        className={isInCart ? 'added-to-cart' : ''}
      >
        {isInCart ? 'Add More' : 'Add to Cart'}
      </button>
      {feedback && <span className="feedback-message">{feedback}</span>}
    </div>
  );
};

export default ProductItem;
