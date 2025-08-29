"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define the shape of the context value
interface CartContextType {
  cart: Record<string, Record<string, number>>;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  getQuantity: (productId: string, size: string) => number;
  getProductQuantities: (productId: string) => Record<string, number>;
  getTotalUnits: () => number;
  clearCart: () => void;
  isEmpty: () => boolean;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, Record<string, number>>>({});

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('wholesale-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wholesale-cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setCart(prev => {
      const newCart = {
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: Math.max(0, Math.min(999, quantity))
        }
      };
      
      // Remove empty entries
      if (newCart[productId] && newCart[productId][size] === 0) {
        delete newCart[productId][size];
      }
      if (newCart[productId] && Object.keys(newCart[productId]).length === 0) {
        delete newCart[productId];
      }
      
      return newCart;
    });
  }, []);

  const getQuantity = useCallback((productId: string, size: string): number => {
    return cart[productId]?.[size] || 0;
  }, [cart]);

  const getProductQuantities = useCallback((productId: string): Record<string, number> => {
    return cart[productId] || {};
  }, [cart]);

  const getTotalUnits = useCallback((): number => {
    return Object.values(cart).reduce((total, productSizes) => {
      return total + Object.values(productSizes).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const isEmpty = useCallback((): boolean => {
    return Object.keys(cart).length === 0 || 
           Object.values(cart).every(productSizes => 
             Object.values(productSizes).every(qty => qty === 0)
           );
  }, [cart]);

  const value = {
    cart,
    updateQuantity,
    getQuantity,
    getProductQuantities,
    getTotalUnits,
    clearCart,
    isEmpty
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use the cart context (exported for use in other components)
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}