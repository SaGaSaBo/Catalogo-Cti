"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Utilidad: formato moneda (ajusta locale si quieres)
const formatPrice = (n: number, locale = "es-CL") =>
  new Intl.NumberFormat(locale).format(n);

// Tipos
export type SizeRow = { label: string; stock?: number; initial?: number };
export type QuickAddProduct = {
  id: string;
  title: string;
  brand: string;
  sku?: string;
  price: number;    // precio unitario
  images?: string[]; // urls
  sizes: SizeRow[];
};

// Stepper accesible
function Stepper({
  value, onChange, min = 0, max = 999, disabled, className = "",
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; disabled?: boolean; className?: string;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className={[
      "inline-flex items-center justify-between w-full h-10 rounded-xl border",
      "bg-white border-gray-200 overflow-hidden", disabled ? "opacity-50" : "", className,
    ].join(" ")}>
      <button
        type="button" onClick={dec} disabled={disabled || value <= min}
        className="h-full w-10 grid place-items-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Disminuir"
      >–</button>

      <input
        value={value}
        onChange={(e) => {
          const n = Number(e.currentTarget.value.replace(/\D/g, ""));
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); inc(); }
          if (e.key === "ArrowDown") { e.preventDefault(); dec(); }
        }}
        inputMode="numeric"
        className="w-12 text-center outline-none text-sm"
        aria-live="polite"
      />

      <button
        type="button" onClick={inc} disabled={disabled || value >= max}
        className="h-full w-10 grid place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Aumentar"
      >+</button>
    </div>
  );
}

// Modal principal
export function ProductQuickAddModal({
  open, onClose, product, onConfirm, locale = "es-CL", brandAccent = "indigo-600",
}: {
  open: boolean;
  onClose: () => void;
  product: QuickAddProduct;
  onConfirm: (p: {
    productId: string;
    quantities: Record<string, number>;
    units: number;
    amount: number;
  }) => void;
  locale?: string;
  brandAccent?: string; // tailwind color, ej: "indigo-600"
}) {
  // bloquear scroll del fondo
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // estado de cantidades por talle
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of product.sizes) map[s.label] = Math.max(0, s.initial ?? 0);
    return map;
  }, [product]);

  const [qty, setQty] = useState<Record<string, number>>(initial);
  useEffect(() => setQty(initial), [initial]);

  const units = useMemo(
    () => Object.values(qty).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0),
    [qty]
  );
  const amount = useMemo(() => units * (product?.price ?? 0), [units, product?.price]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const [activeIdx, setActiveIdx] = useState(0);
  const images = product.images?.length ? product.images : [""];

  const onConfirmClick = useCallback(() => {
    onConfirm({ productId: product.id, quantities: qty, units, amount });
    onClose();
  }, [onConfirm, product.id, qty, units, amount, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      aria-modal="true" role="dialog"
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Galería */}
        <div className="p-6 lg:p-8 bg-gray-50">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-gray-200">
            {images[activeIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[activeIdx]} alt={product.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400">Sin imagen</div>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i} onClick={() => setActiveIdx(i)}
                className={[
                  "relative shrink-0 w-16 h-16 rounded-lg border bg-white",
                  i === activeIdx ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200",
                ].join(" ")}
                aria-label={`Imagen ${i + 1}`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="miniatura" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No img</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info + talles */}
        <div className="p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold leading-tight">{product.title}</h2>
              <div className="text-gray-500 mt-0.5">
                {product.brand}{product.sku ? ` · SKU: ${product.sku}` : ""}
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-full border border-gray-200 hover:bg-gray-50"
              aria-label="Cerrar"
            >✕</button>
          </div>

          <div className="mt-4 text-3xl font-semibold text-gray-900">
            ${formatPrice(product.price, locale)}
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-3">Selecciona talles y cantidades:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.sizes.map(({ label, stock }) => (
                <div key={label} className="p-3 rounded-xl border border-gray-200 bg-white">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    {typeof stock === "number" && (
                      <span className="text-[11px] text-gray-500">stock {stock}</span>
                    )}
                  </div>
                  <Stepper
                    value={qty[label] ?? 0}
                    onChange={(v) => setQty((q) => ({ ...q, [label]: v }))}
                    min={0}
                    max={stock ?? 999}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8" />
        </div>
      </div>

      {/* Footer fijo */}
      <div className="fixed left-0 right-0 bottom-0 pointer-events-none">
        <div className="pointer-events-auto max-w-5xl mx-auto px-4 pb-4">
          <div className="rounded-xl border bg-white shadow-lg flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-3 p-3">
            <div className="px-2">
              <div className="text-sm text-gray-600">Unidades</div>
              <div className="text-xl font-semibold tabular-nums">{units}</div>
            </div>
            <div className="px-2">
              <div className="text-sm text-gray-600">Total aprox.</div>
              <div className="text-xl font-semibold tabular-nums">${formatPrice(amount, locale)}</div>
            </div>
            <div className="flex-1" />
            <button
              onClick={onConfirmClick}
              className="h-12 px-5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
              disabled={units === 0}
            >
              ✓ OK – Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
