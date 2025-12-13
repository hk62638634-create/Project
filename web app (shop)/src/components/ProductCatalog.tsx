import React, { useState, useEffect } from 'react';
import { getAllItems, Item } from '../core';
import ProductItem from './ProductItem';

// 商品目录主组件 - 负责加载并展示所有商品
const ProductCatalog: React.FC = () => {
  // 存储所有商品数据，使用 readonly 防止意外修改
  const [products, setProducts] = useState<readonly Item[]>([]);

  // 组件挂载后只执行一次：加载静态商品数据
  useEffect(() => {
    // getAllItems() 是同步函数，直接获取核心数据
    // 如后续改为接口请求，可在此处改为 async/await + loading/error 状态
    const items = getAllItems();
    setProducts(items);
  }, []); // 空依赖数组 → 只在组件 mount 时运行一次

  return (
    <div className="product-catalog-container">
      {/* 页面主标题 */}
      <h2>Product Catalog</h2>

      {/* 商品列表容器（支持 CSS Grid 或 Flex 布局） */}
      <div className="product-list">
        {/* 遍历商品数组，渲染每个商品卡片 */}
        {products.map((product) => (
          // key 使用唯一 id，保证列表高效更新和正确复用组件
          <ProductItem key={product.id} product={product} />
        ))}
      </div>

      {/* 可选：空数据占位（当前数据固定存在，可保留备用） */}
      {/* {products.length === 0 && <p>No products available.</p>} */}
    </div>
  );
};

export default ProductCatalog;
