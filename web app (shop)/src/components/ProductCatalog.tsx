import React, { useState, useEffect } from 'react';
import { getAllItems, Item } from '../core'; // 从 core.ts 导入所有商品数据和 Item 类型定义
import ProductItem from './ProductItem'; // 商品单项展示组件

/**
 * 商品目录组件
 * 负责加载并展示所有商品列表
 * 使用 useEffect 在组件挂载时一次性获取商品数据
 */
const ProductCatalog: React.FC = () => {
  // 状态：存储商品列表，使用只读数组类型确保数据不被意外修改
  // 初始化为空数组
  const [products, setProducts] = useState<readonly Item[]>([]);

  /**
   * 副作用钩子：组件首次渲染后执行
   * 用于从 core.ts 中获取所有商品数据并更新状态
   * 依赖数组为空 []，表示只在组件挂载时执行一次
   */
  useEffect(() => {
    // 调用核心模块的函数获取所有商品数据（假设是同步的静态数据）
    // 如果未来改为异步 API 请求，这里可以改成 async/await + try-catch
    const items = getAllItems();
    setProducts(items);
  }, []); // 空依赖：仅在组件 mount 时运行

  return (
    <div className="product-catalog-container">
      {/* 页面标题 */}
      <h2>📦 商品目录</h2>

      {/* 商品网格或列表容器 */}
      <div className="product-list">
        {/* 遍历商品数组，为每个商品渲染 ProductItem 组件 */}
        {products.map((product) => (
          // key 使用商品的唯一 id，确保 React 高效更新列表
          <ProductItem key={product.id} product={product} />
        ))}
      </div>

      {/* 可选：空状态处理（当前数据固定有值时可不加） */}
      {/* {products.length === 0 && <p>暂无商品</p>} */}
    </div>
  );
};

export default ProductCatalog;
