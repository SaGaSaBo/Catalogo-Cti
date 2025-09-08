import React from "react";

export function ACHeader({
  title = "ALTOCONCEPTO",
  subtitle = "Mayorista",
  cartCount = 0,
  onCartClick,
}: {
  title?: string;
  subtitle?: string;
  cartCount?: number;
  onCartClick?: () => void;
}) {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{title}</div>
            {subtitle && <div className="text-sm text-gray-500 -mt-0.5">{subtitle}</div>}
          </div>

          <button
            onClick={onCartClick}
            className="relative inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
          >
            <span aria-hidden>🧺</span>
            Carrito
            {cartCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-indigo-600 text-white text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
