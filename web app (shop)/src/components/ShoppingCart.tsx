import React from 'react';
import { useCart } from '../CartContext';
import CartItem from './CartItem';

// 统一格式化价格，始终显示两位小数并带 $ 符号
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const ShoppingCart: React.FC = () => {
  // 从购物车上下文获取当前购物车数据、总金额以及清空方法
  const { cart, totalAmount, resetCart } = useCart();

  // 清空购物车前的二次确认
  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      resetCart();
    }
  };

  // 计算购物车中所有商品的总件数（各种商品数量之和）
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shopping-cart-container">
      {/* 购物车标题 + 商品总件数 */}
      <h2>Shopping Cart ({totalItemsCount} items)</h2>

      {/* 购物车为空时的提示 */}
      {cart.length === 0 ? (
        <p className="empty-cart-message">
          Your cart is empty. Go ahead and add some products!
        </p>
      ) : (
        <>
          {/* 商品列表区域 */}
          <div className="cart-item-list">
            {cart.map((item) => (
              // 每条商品使用 CartItem 组件渲染，key 保证列表高效更新
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* 订单汇总区域：显示总金额 + 清空按钮 */}
          <div className="cart-summary">
            <h3>
              Order Total: <span className="total-amount">{formatPrice(totalAmount)}</span>
            </h3>
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
