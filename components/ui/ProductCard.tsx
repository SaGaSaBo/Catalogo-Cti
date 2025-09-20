"use client";
import React, { useState } from "react";
import UiImg from "@/components/UiImg";
import NextImage from "next/image";
import { ProductQuickAddModal, type QuickAddProduct } from "@/components/product-quickadd-modal";
import { Product } from "@/lib/types";

export const formatPrice = (n: number, locale = "es-AR") =>
  new Intl.NumberFormat(locale).format(n);

export type ProductCardProps = {
  product: Product;
  onDetails?: () => void;
  onAddToCart?: () => void;
  onQuickAdd?: (payload: {
    productId: string;
    quantities: Record<string, number>;
    units: number;
    amount: number;
  }) => void;
};

export function ProductCard({
  product,
  onDetails,
  onAddToCart,
  onQuickAdd,
}: ProductCardProps) {
  const {
    id: productId,
    title,
    brand,
    description,
    sku,
    price,
    sizes = [],
    imageUrls = [],
    image_urls = [],
    image_paths = [],
    category
  } = product;

  // Usar imageUrls como fallback, luego image_urls, luego image_paths
  const images = imageUrls.length > 0 ? imageUrls : image_urls.length > 0 ? image_urls : image_paths;
  const primaryImage = images[0];
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<QuickAddProduct | null>(null);

  const shown = sizes.slice(0, 6);
  const rest = Math.max(0, sizes.length - shown.length);

  const openQuickAdd = () => {
    const mapped: QuickAddProduct = {
      id: productId || title, // fallback al título si no hay ID
      title,
      brand,
      description,
      sku,
      price,
      images: images.length > 0 ? images : [],
      sizes: sizes.map((s) => ({ label: s, stock: 999, initial: 0 })),
    };
    setSelectedProduct(mapped);
    setOpen(true);
  };

  const handleQuickAdd = (items: Array<{ size: string; qty: number }>) => {
    const quantities: Record<string, number> = {};
    let units = 0;
    let amount = 0;

    items.forEach(({ size, qty }) => {
      quantities[size] = qty;
      units += qty;
      amount += qty * price;
    });

    onQuickAdd?.({
      productId: productId || title,
      quantities,
      units,
      amount,
    });
    setOpen(false);
  };

  return (
    <>
      <article className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300">
        {/* Imagen del producto */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
          {primaryImage ? (
            <UiImg
              src={primaryImage}
              alt={title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              priority={false}
              widthHint={400}
              qualityHint={70}
              format="webp"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{brand}</p>
            {sku && (
              <p className="text-xs text-gray-400 font-mono mt-1">SKU: {sku}</p>
            )}
            {category && (
              <p className="text-xs text-blue-600 mt-1">{category.name}</p>
            )}
            {/* Snippet de descripción (2 líneas) */}
            {description && (
              <p className="text-sm text-gray-600 whitespace-pre-line overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] min-h-10 mt-2">
                {description}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="mb-3">
            <span className="text-lg font-bold text-gray-900">
              ${formatPrice(price)}
            </span>
          </div>

          {/* Talles */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {shown.map((size) => (
                  <span
                    key={size}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                  >
                    {size}
                  </span>
                ))}
                {rest > 0 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                    +{rest}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botón de agregar */}
          <button
            onClick={openQuickAdd}
            className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Agregar
          </button>
        </div>
      </article>

      {/* Modal de selección rápida */}
      <ProductQuickAddModal
        isOpen={open}
        onClose={() => setOpen(false)}
        product={selectedProduct}
        onAddToCart={handleQuickAdd}
      />
    </>
  );
}
