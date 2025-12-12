import React, { useState, useEffect } from 'react';
import { getAllItems, Item } from '../core'; // 导入 Item 类型
import ProductItem from './ProductItem';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<readonly Item[]>([]); // 使用 Item[]

  useEffect(() => {
    // Load data from core.ts
    setProducts(getAllItems());
  }, []);

  return (
    <div className="product-catalog-container">
      <h2>📦 Product Catalog</h2>
      <div className="product-list">
        {products.map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
