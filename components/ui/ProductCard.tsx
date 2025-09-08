import React from "react";

export const formatPrice = (n: number, locale = "es-AR") =>
  new Intl.NumberFormat(locale).format(n);

export type ProductCardProps = {
  imageUrl?: string;
  title: string;
  brand: string;
  sku?: string;
  price: number;
  sizes?: string[];
  onDetails?: () => void;
  onAddToCart?: () => void;
};

export function ProductCard({
  imageUrl,
  title,
  brand,
  sku,
  price,
  sizes = [],
  onDetails,
  onAddToCart,
}: ProductCardProps) {
  const shown = sizes.slice(0, 6);
  const rest = Math.max(0, sizes.length - shown.length);

  return (
    <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.06)] border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative aspect-[4/5] bg-gray-100">
        {imageUrl ? (
          // Usa <Image> si querés, pero para preview un <img> simple es suficiente
          <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-400 text-sm">Sin imagen</div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{brand}</div>
        <h3 className="text-base font-semibold leading-snug line-clamp-2">{title}</h3>
        {sku && <div className="text-xs text-gray-500">SKU: {sku}</div>}

        <div className="mt-1 text-2xl font-semibold tabular-nums">${formatPrice(price)}</div>

        {!!sizes.length && (
          <div className="pt-1 flex flex-wrap gap-1">
            {shown.map((s) => (
              <span key={s} className="px-2 h-7 rounded-full text-xs grid place-items-center bg-gray-100 text-gray-700">
                {s}
              </span>
            ))}
            {rest > 0 && (
              <span className="px-2 h-7 rounded-full text-xs grid place-items-center border border-gray-200 text-gray-600">+{rest}</span>
            )}
          </div>
        )}

        <div className="pt-2 mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={onDetails}
            className="h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
          >
            Ver Detalles
          </button>
          <button
            onClick={onAddToCart}
            className="h-10 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
