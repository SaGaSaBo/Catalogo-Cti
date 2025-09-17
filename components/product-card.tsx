"use client";

import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/store/cart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, setQty } = useCart();
  
  // Obtener moneda y mapear símbolos a códigos ISO
  const rawCurrency = process.env.NEXT_PUBLIC_CURRENCY || 'CLP';
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'CLP': 'CLP'
  };
  const currency = currencyMap[rawCurrency] || rawCurrency;
  
  // Get quantities for this product
  const productItems = items.filter(item => item.productId === product.id);
  const quantities: Record<string, number> = {};
  productItems.forEach(item => {
    if (item.size) {
      quantities[item.size] = item.qty;
    }
  });
  
  const subtotal = Object.entries(quantities).reduce(
    (sum, [_, qty]) => sum + (qty * product.price), 0
  );

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const key = `${product.id}__${size}`;
    setQty(key, quantity);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {product.brand}
          </Badge>
          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <p className="text-2xl font-bold text-blue-600">{currency} {product.price}</p>
      </div>

      {/* Gallery */}
      <div className="px-6 pb-4">
        <ProductGallery images={product.imageUrls} title={product.title} />
      </div>

      {/* Sizes & Quantities */}
      <div className="px-6 pb-6">
        <Label className="text-base font-semibold mb-3 block">Cantidades por Talle</Label>
        <div className="grid grid-cols-3 gap-3">
          {product.sizes.map((size) => (
            <div key={size} className="space-y-1">
              <Label htmlFor={`${product.id}-${size}`} className="text-sm font-medium">
                Talle {size}
              </Label>
              <Input
                id={`${product.id}-${size}`}
                type="number"
                min="0"
                max="999"
                value={quantities[size] || 0}
                onChange={(e) => handleQuantityChange(size, e.target.value)}
                className="text-center"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        {/* Subtotal */}
        {subtotal > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <span className="text-lg font-bold text-green-600">
                {currency} {subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}