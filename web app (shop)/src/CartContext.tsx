import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Item } from './core'; // 导入 Item

// Cart Item Type
export interface CartItem {
  id: string; // 更改 ID 类型为 string
  title: string;
  price: number;
  quantity: number;
}

// Context Definition Type
export interface CartContextType {
  cart: CartItem[];
  totalAmount: number;
  addToCart: (item: Item) => void; // 使用 Item 类型
  removeFromCart: (id: string) => void; // 更改 ID 类型为 string
  updateQuantity: (id: string, newQuantity: number) => void; // 更改 ID 类型为 string
  resetCart: () => void;
  isItemInCart: (id: string) => boolean; // 更改 ID 类型为 string
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ecommerceCart';

// Helper: Load cart from localStorage
const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Helper: Calculate total amount
const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromLocalStorage);
  const [totalAmount, setTotalAmount] = useState(0);

  // Update total amount and save to localStorage whenever the cart changes
  useEffect(() => {
    const newTotal = calculateTotalAmount(cart);
    setTotalAmount(newTotal);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Add item to cart or increment quantity
  const addToCart = useCallback((item: Item) => { // 使用 Item 类型
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);

      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Item does not exist, add new item
        return [...prevCart, {
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1
        }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((id: string) => { // 更改 ID 类型为 string
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((id: string, newQuantity: number) => { // 更改 ID 类型为 string
    if (newQuantity < 1) {
      // If quantity is reduced to 0 or less, remove the item
      removeFromCart(id);
      return;
    }

    setCart(prevCart => prevCart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  }, [removeFromCart]);

  // Clear the entire cart
  const resetCart = useCallback(() => {
    setCart([]);
  }, []);

  // Check if item is in cart
  const isItemInCart = useCallback((id: string): boolean => { // 更改 ID 类型为 string
    return cart.some(item => item.id === id);
  }, [cart]);

  const contextValue: CartContextType = {
    cart,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
    isItemInCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
