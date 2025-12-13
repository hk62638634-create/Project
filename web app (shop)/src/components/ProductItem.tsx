import React, { useCallback, useState } from 'react';
import { Item } from '../core';
import { useCart } from '../CartContext';

// Props 类型定义
interface ProductItemProps {
  product: Item;
}

// 统一格式化价格 → $xx.xx
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  // 从购物车上下文获取添加商品和判断是否已存在的函数
  const { addToCart, isItemInCart } = useCart();

  // 控制点击后短暂的成功提示文字
  const [feedback, setFeedback] = useState<string | null>(null);

  // 当前商品是否已经在购物车里
  const isInCart = isItemInCart(product.id);

  // 点击“加入购物车”或“加购”按钮的处理函数（使用 useCallback 防止不必要重渲染）
  const handleAddToCart = useCallback(() => {
    addToCart(product);                                    // 执行添加（已存在则自动+1）
    setFeedback(isInCart ? 'Quantity Increased!' : 'Added to Cart!'); // 不同状态显示不同提示
    setTimeout(() => setFeedback(null), 1500);            // 1.5 秒后自动清除提示
  }, [addToCart, product, isInCart]);

  return (
    <div className="product-item">
      {/* 商品标题 */}
      <h3>{product.title}</h3>

      {/* 商品描述 */}
      <p className="product-description">{product.description}</p>

      {/* 商品价格 */}
      <p className="product-price">
        <strong>Price: {formatPrice(product.price)}</strong>
      </p>

      {/* 加入购物车按钮 - 已加入时文字变为 Add More，并可通过 class 调整样式 */}
      <button
        onClick={handleAddToCart}
        className={isInCart ? 'added-to-cart' : ''}
      >
        {isInCart ? 'Add More' : 'Add to Cart'}
      </button>

      {/* 点击成功后的短暂反馈提示 */}
      {feedback && <span className="feedback-message">{feedback}</span>}
    </div>
  );
};

export default ProductItem;
