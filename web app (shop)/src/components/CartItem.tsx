import React, { useCallback } from 'react';
import { CartItem as TCartItem, useCart } from '../CartContext';

// 定义组件的 Props 类型
interface CartItemProps {
  item: TCartItem; // 购物车中的单条商品数据
}

/**
 * 格式化价格，始终保留两位小数并加上美元符号
 * @param price 商品单价（数字）
 * @returns 格式化后的字符串，例如 "$29.99"
 */
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

/**
 * 购物车单项组件
 * 负责展示一条商品的信息、数量调整、删除功能以及小计金额
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  // 从购物车上下文获取更新数量和删除商品的方法
  const { updateQuantity, removeFromCart } = useCart();

  // 计算当前商品的小计（单价 × 数量）
  const itemTotal = item.price * item.quantity;

  /**
   * 处理数量增减
   * 使用 useCallback 进行性能优化，避免不必要的重新渲染
   */
  const handleUpdateQuantity = useCallback(
    (delta: number) => {
      const newQuantity = item.quantity + delta;
      // 如果减少到 0 以下，这里不会触发（按钮已禁用），但仍可自行决定是否允许 0
      updateQuantity(item.id, newQuantity);
    },
    [item.id, item.quantity, updateQuantity] // 依赖项：商品 id、当前数量、更新函数
  );

  /**
   * 删除当前商品
   */
  const handleRemove = useCallback(() => {
    removeFromCart(item.id);
  }, [item.id, removeFromCart]);

  return (
    <div className="cart-item">
      {/* 商品基本信息 */}
      <div className="item-info">
        <h4>{item.title}</h4>
        <p className="item-price-unit">单价: {formatPrice(item.price)}</p>
      </div>

      {/* 操作区域：数量控制、小计、删除按钮 */}
      <div className="item-controls">
        {/* 数量加减控制 */}
        <div className="quantity-control">
          <button
            onClick={() => handleUpdateQuantity(-1)}
            disabled={item.quantity <= 1} // 数量为 1 时禁止再减（可根据业务改成 <=0）
          >
            -
          </button>
          <span className="item-quantity">{item.quantity}</span>
          <button onClick={() => handleUpdateQuantity(1)}>+</button>
        </div>

        {/* 小计金额 */}
        <div className="item-total-price">
          <p>
            小计: <strong>{formatPrice(itemTotal)}</strong>
          </p>
        </div>

        {/* 删除按钮 */}
        <button className="remove-btn" onClick={handleRemove}>
          移除
        </button>
      </div>
    </div>
  );
};

export default CartItem;
