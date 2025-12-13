import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Item } from './core';

// 购物车单项类型（与 Item 基本一致，但多了 quantity）
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

// Context 对外暴露的所有属性和方法
export interface CartContextType {
  cart: CartItem[];
  totalAmount: number;
  addToCart: (item: Item) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  resetCart: () => void;
  isItemInCart: (id: string) => boolean;
}

// 创建 Context（初始为 undefined，强制必须在 Provider 内使用）
const CartContext = createContext<CartContextType | undefined>(undefined);

// localStorage 键名
const LOCAL_STORAGE_KEY = 'ecommerceCart';

// 从 localStorage 读取购物车数据（出错时返回空数组）
const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

// 计算购物车总金额
const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Provider 组件
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始从 localStorage 加载购物车
  const [cart, setCart] = useState<CartItem[]>(loadCartFromLocalStorage);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // 每当 cart 变化时：重新计算总价 + 持久化到 localStorage
  useEffect(() => {
    const newTotal = calculateTotalAmount(cart);
    setTotalAmount(newTotal);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  // 添加商品（已存在则数量+1）
  const addToCart = useCallback((item: Item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        // 已存在 → 数量 +1
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      // 不存在 → 新增一条
      return [...prev, { id: item.id, title: item.title, price: item.price, quantity: 1 }];
    });
  }, []);

  // 完全移除某件商品
  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 更新数量（若新数量 ≤ 0 则直接删除该商品）
  const updateQuantity = useCallback(
    (id: string, newQuantity: number) => {
      if (newQuantity < 1) {
        removeFromCart(id);
        return;
      }
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
    },
    [removeFromCart]
  );

  // 清空整个购物车
  const resetCart = useCallback(() => {
    setCart([]);
  }, []);

  // 判断商品是否已在购物车中
  const isItemInCart = useCallback(
    (id: string): boolean => cart.some((item) => item.id === id),
    [cart]
  );

  // Context 提供的值
  const contextValue: CartContextType = {
    cart,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
    isItemInCart,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// 自定义 Hook，方便组件使用购物车功能
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
