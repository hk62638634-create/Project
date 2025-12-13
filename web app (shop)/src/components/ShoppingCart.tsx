import React from 'react';
import { useCart } from '../CartContext'; // 购物车全局状态上下文
import CartItem from './CartItem';       // 购物车单条商品组件

/**
 * 价格格式化函数：统一显示为 $xx.xx 格式
 */
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

/**
 * 购物车主组件
 * 显示当前购物车中的所有商品、数量统计、总金额
 * 提供清空购物车功能
 */
const ShoppingCart: React.FC = () => {
  // 从购物车上下文获取：商品列表、总金额、全部清空方法
  const { cart, totalAmount, resetCart } = useCart();

  /**
   * 清空购物车前的二次确认
   */
  const handleReset = () => {
    // 使用原生 confirm 进行二次确认，防止误操作
    if (window.confirm('确定要清空购物车吗？此操作不可恢复！')) {
      resetCart(); // 执行清空
    }
  };

  // 计算购物车中商品的总件数（多种商品的数量之和）
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shopping-cart-container">
      {/* 标题 + 商品总数 */}
      <h2>购物车 ({totalItems} 件商品)</h2>

      {/* 空购物车状态 */}
      {cart.length === 0 ? (
        <p className="empty-cart-message">
          购物车还是空的，快去挑选心仪的商品吧！
        </p>
      ) : (
        <>
          {/* 商品列表 */}
          <div className="cart-item-list">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* 订单汇总区域 */}
          <div className="cart-summary">
            <h3>
              订单总额:{' '}
              <span className="total-amount">{formatPrice(totalAmount)}</span>
            </h3>

            {/* 清空购物车按钮 */}
            <button className="reset-btn" onClick={handleReset}>
              清空购物车
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
