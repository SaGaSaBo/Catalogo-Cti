"use client";

import { OrderItem, Product } from '@/lib/types';
import { useCartContext } from '@/context/cart-context';

export function useCart() {
  const { 
    cart,
    updateQuantity,
    getQuantity,
    getProductQuantities,
    getTotalUnits,
    clearCart,
    isEmpty
  } = useCartContext();

  // These functions still need the 'products' array, so they remain here
  const getCartItems = (products: Product[]): OrderItem[] => {
    return products
      .filter(product => cart[product.id])
      .map(product => {
        const quantities = cart[product.id];
        const subtotal = Object.entries(quantities).reduce(
          (sum, [_, qty]) => sum + (qty * product.price), 0
        );
        
        return {
          productId: product.id,
          brand: product.brand,
          title: product.title,
          sku: product.sku,
          price: product.price,
          imageUrl: product.imageUrls[0],
          quantities,
          subtotal
        };
      })
      .filter(item => Object.values(item.quantities).some(qty => qty > 0));
  };

  const getTotalAmount = (products: Product[]): number => {
    return getCartItems(products).reduce((total, item) => total + item.subtotal, 0);
  };

  return {
    updateQuantity,
    getQuantity,
    getProductQuantities,
    getTotalUnits,
    getCartItems,
    getTotalAmount,
    clearCart,
    isEmpty
  };
}