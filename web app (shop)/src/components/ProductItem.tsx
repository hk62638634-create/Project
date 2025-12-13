import React, { useCallback, useState } from 'react';
import { Item } from '../core'; // 从 core.ts 导入商品类型定义
import { useCart } from '../CartContext'; // 购物车上下文

// 定义组件 Props 类型
interface ProductItemProps {
  product: Item; // 当前要展示的单个商品数据
}

/**
 * 价格格式化函数
 * 将数字价格转换为带美元符号且保留两位小数的字符串
 * @param price 商品单价
 * @returns 例如 "$29.99"
 */
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

/**
 * 商品单项组件
 * 在商品目录中展示单个商品的信息，包括标题、描述、价格和“加入购物车”按钮
 * 支持已加入购物车的商品显示“Add More”并给出相应反馈提示
 */
const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  // 从购物车上下文获取添加商品函数和检查是否已存在的方法
  const { addToCart, isItemInCart } = useCart();

  // 临时反馈消息状态（如“已添加”或“数量+1”）
  const [feedback, setFeedback] = useState<string | null>(null);

  // 判断当前商品是否已经在购物车中
  const isInCart = isItemInCart(product.id);

  /**
   * 处理“加入购物车”点击事件
   * 使用 useCallback 缓存函数，避免不必要重新渲染
   */
  const handleAddToCart = useCallback(() => {
    // 执行添加操作（如果已存在则自动增加数量）
    addToCart(product);

    // 根据是否已存在给出不同的成功提示
    setFeedback(isInCart ? '✅ 数量已增加！' : '🛒 已加入购物车！');

    // 1.5 秒后自动清除提示消息
    setTimeout(() => setFeedback(null), 1500);
  }, [addToCart, product, isInCart]); // 依赖：添加函数、商品对象、当前是否在购物车

  return (
    <div className="product-item">
      {/* 商品标题 */}
      <h3>{product.title}</h3>

      {/* 商品描述 */}
      <p className="product-description">{product.description}</p>

      {/* 商品价格 */}
      <p className="product-price">
        <strong>价格: {formatPrice(product.price)}</strong>
      </p>

      {/* 加入购物车按钮 */}
      <button
        onClick={handleAddToCart}
        // 已加入购物车时添加特殊类名，便于样式区分（如变色）
        className={isInCart ? 'added-to-cart' : ''}
      >
        {isInCart ? '加购' : '加入购物车'}
      </button>

      {/* 临时成功反馈提示，出现后自动消失 */}
      {feedback && <span className="feedback-message">{feedback}</span>}
    </div>
  );
};

export default ProductItem;
