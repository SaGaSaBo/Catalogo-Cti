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

  // Add to cart function
  const addToCart = (item: {
    id: string;
    productId: string;
    title: string;
    brand: string;
    price: number;
    size: string;
    quantity: number;
    imageUrl: string;
  }) => {
    const currentQuantity = getQuantity(item.productId, item.size);
    updateQuantity(item.productId, item.size, currentQuantity + item.quantity);
  };

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
    addToCart,
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