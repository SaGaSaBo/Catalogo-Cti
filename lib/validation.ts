import { Product, OrderPayload, Buyer, OrderItem } from './types';

export function validateProduct(p: unknown): { ok: boolean; error?: string } {
  if (!p || typeof p !== 'object') {
    return { ok: false, error: 'Product must be an object' };
  }

  const product = p as any;

  // brand: string no vacío, ≤ 80
  if (!product.brand || typeof product.brand !== 'string' || product.brand.trim() === '') {
    return { ok: false, error: 'Brand is required and must be a non-empty string' };
  }
  if (product.brand.length > 80) {
    return { ok: false, error: 'Brand must be 80 characters or less' };
  }

  // title: string no vacío
  if (!product.title || typeof product.title !== 'string' || product.title.trim() === '') {
    return { ok: false, error: 'Title is required and must be a non-empty string' };
  }

  // description: string opcional
  if (product.description !== undefined && (typeof product.description !== 'string')) {
    return { ok: false, error: 'Description must be a string if provided' };
  }

  // sku: string no vacío
  if (!product.sku || typeof product.sku !== 'string' || product.sku.trim() === '') {
    return { ok: false, error: 'SKU is required and must be a non-empty string' };
  }

  // price: number > 0
  if (typeof product.price !== 'number' || product.price <= 0) {
    return { ok: false, error: 'Price must be a positive number' };
  }

  // sizes: string[] no vacía
  if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
    return { ok: false, error: 'Sizes must be a non-empty array' };
  }
  if (!product.sizes.every((size: any) => typeof size === 'string')) {
    return { ok: false, error: 'All sizes must be strings' };
  }

  // imageUrls: string[] con ≤ 4
  if (!Array.isArray(product.imageUrls)) {
    return { ok: false, error: 'ImageUrls must be an array' };
  }
  if (product.imageUrls.length > 4) {
    return { ok: false, error: 'Maximum 4 images allowed' };
  }
  if (!product.imageUrls.every((url: any) => typeof url === 'string')) {
    return { ok: false, error: 'All image URLs must be strings' };
  }

  // active: boolean
  if (typeof product.active !== 'boolean') {
    return { ok: false, error: 'Active must be a boolean' };
  }

  // sortIndex: number
  if (typeof product.sortIndex !== 'number') {
    return { ok: false, error: 'SortIndex must be a number' };
  }

  // categoryId: string opcional
  if (product.categoryId !== undefined && typeof product.categoryId !== 'string') {
    return { ok: false, error: 'CategoryId must be a string if provided' };
  }

  return { ok: true };
}

export function validateCategory(c: unknown): { ok: boolean; error?: string } {
  if (!c || typeof c !== 'object') {
    return { ok: false, error: 'Category must be an object' };
  }

  const category = c as any;

  // name: string no vacío
  if (!category.name || typeof category.name !== 'string' || category.name.trim() === '') {
    return { ok: false, error: 'Name is required and must be a non-empty string' };
  }

  return { ok: true };
}

export function validateOrderPayload(payload: any): { 
  ok: boolean; 
  error?: string; 
  normalized?: OrderPayload 
} {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Payload must be an object' };
  }

  // Normalizar buyer/customerInfo
  let buyer: Buyer;
  if (payload.buyer) {
    buyer = payload.buyer;
  } else if (payload.customerInfo) {
    buyer = payload.customerInfo;
  } else {
    return { ok: false, error: 'Either buyer or customerInfo is required' };
  }

  // Validar buyer
  if (!buyer.name || typeof buyer.name !== 'string' || buyer.name.trim() === '') {
    return { ok: false, error: 'Buyer name is required and must be a non-empty string' };
  }
  if (!buyer.email || typeof buyer.email !== 'string' || buyer.email.trim() === '') {
    return { ok: false, error: 'Buyer email is required and must be a non-empty string' };
  }
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(buyer.email)) {
    return { ok: false, error: 'Buyer email must be a valid email address' };
  }
  if (buyer.phone && typeof buyer.phone !== 'string') {
    return { ok: false, error: 'Buyer phone must be a string if provided' };
  }

  // Validar items no vacío
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { ok: false, error: 'Items must be a non-empty array' };
  }

  // Validar cada item
  let calculatedTotalUnits = 0;
  let calculatedTotalAmount = 0;

  for (const item of payload.items) {
    if (!item || typeof item !== 'object') {
      return { ok: false, error: 'Each item must be an object' };
    }

    // Validar campos requeridos del item
    if (!item.productId || typeof item.productId !== 'string') {
      return { ok: false, error: 'Item productId is required and must be a string' };
    }
    if (!item.brand || typeof item.brand !== 'string') {
      return { ok: false, error: 'Item brand is required and must be a string' };
    }
    if (!item.title || typeof item.title !== 'string') {
      return { ok: false, error: 'Item title is required and must be a string' };
    }
    if (!item.sku || typeof item.sku !== 'string') {
      return { ok: false, error: 'Item sku is required and must be a string' };
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      return { ok: false, error: 'Item price must be a positive number' };
    }
    if (typeof item.subtotal !== 'number' || item.subtotal < 0) {
      return { ok: false, error: 'Item subtotal must be a non-negative number' };
    }

    // Validar quantities
    if (!item.quantities || typeof item.quantities !== 'object') {
      return { ok: false, error: 'Item quantities must be an object' };
    }

    let itemTotalUnits = 0;
    let itemCalculatedSubtotal = 0;
    let hasPositiveQuantity = false;

    for (const [size, quantity] of Object.entries(item.quantities)) {
      if (typeof quantity !== 'number' || quantity < 0) {
        return { ok: false, error: 'All quantities must be non-negative numbers' };
      }
      if (quantity > 0) {
        hasPositiveQuantity = true;
        itemTotalUnits += quantity;
        itemCalculatedSubtotal += quantity * item.price;
      }
    }

    if (!hasPositiveQuantity) {
      return { ok: false, error: 'Each item must have at least one positive quantity' };
    }

    // Verificar que el subtotal sea consistente
    if (Math.abs(item.subtotal - itemCalculatedSubtotal) > 0.01) {
      return { ok: false, error: 'Item subtotal is inconsistent with quantities and price' };
    }

    calculatedTotalUnits += itemTotalUnits;
    calculatedTotalAmount += item.subtotal;
  }

  // Validar totales
  if (typeof payload.totalUnits !== 'number' || payload.totalUnits !== calculatedTotalUnits) {
    return { ok: false, error: 'Total units is inconsistent with item quantities' };
  }
  if (typeof payload.totalAmount !== 'number' || Math.abs(payload.totalAmount - calculatedTotalAmount) > 0.01) {
    return { ok: false, error: 'Total amount is inconsistent with item subtotals' };
  }

  // Crear payload normalizado
  const normalized: OrderPayload = {
    buyer: {
      name: buyer.name.trim(),
      email: buyer.email.trim(),
      phone: buyer.phone?.trim()
    },
    items: payload.items,
    totalUnits: payload.totalUnits,
    totalAmount: payload.totalAmount,
    currency: payload.currency,
    source: payload.source
  };

  return { ok: true, normalized };
}