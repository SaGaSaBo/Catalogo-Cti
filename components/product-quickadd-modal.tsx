"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scroll-lock";

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
      "inline-flex items-center justify-between w-full h-10 sm:h-10 rounded-xl border",
      "bg-white border-gray-200 overflow-hidden", disabled ? "opacity-50" : "", className,
    ].join(" ")}>
      <button
        type="button" onClick={dec} disabled={disabled || value <= min}
        className="h-full w-8 sm:w-10 grid place-items-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 touch-manipulation"
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
        className="w-10 sm:w-12 text-center outline-none text-sm font-medium"
        aria-live="polite"
      />

      <button
        type="button" onClick={inc} disabled={disabled || value >= max}
        className="h-full w-8 sm:w-10 grid place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 touch-manipulation"
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
  // Bloquear scroll del fondo con utilidad avanzada
  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
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

  // Prevenir scroll del body en iOS cuando se toca fuera del modal
  const onOverlayTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const [activeIdx, setActiveIdx] = useState(0);
  const images = product.images?.length ? product.images : [""];
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Referencias para accesibilidad
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startTrapRef = useRef<HTMLSpanElement>(null);
  const endTrapRef = useRef<HTMLSpanElement>(null);

  const onConfirmClick = useCallback(() => {
    onConfirm({ productId: product.id, quantities: qty, units, amount });
    onClose();
  }, [onConfirm, product.id, qty, units, amount, onClose]);

  // 1. Cerrar con Esc y devolver foco
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Devolver foco al disparador
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  // 2. Trampa de foco (focus trap) simple
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    // foco inicial
    const focusable = dialogRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const handleFocus = (e: FocusEvent) => {
      if (!dialogRef.current) return;
      if (!dialogRef.current.contains(e.target as Node)) {
        // si el foco se fue, devolverlo al primer foco dentro del modal
        focusable?.focus();
      }
    };
    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Sentinelas de foco */}
      <span ref={startTrapRef} tabIndex={0} className="sr-only" />
      
      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        onTouchMove={onOverlayTouchMove}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-start sm:items-center justify-center p-0 sm:p-4"
        aria-modal="true" role="dialog"
      >
        <div 
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-title"
          aria-describedby="qa-desc"
          className="w-full h-full sm:max-w-5xl sm:max-h-[90vh] sm:rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        >
        {/* Contenedor scrolleable completo */}
        <div ref={contentRef} className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Galería - Parte del scroll natural */}
          <div className="p-2 sm:p-6 lg:p-8 bg-gray-50">
            <div className="aspect-[3/4] sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-200">
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
          <div className="p-2 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 id="qa-title" className="text-sm sm:text-xl lg:text-2xl font-bold leading-tight">{product.title}</h2>
                  <div className="text-gray-500 mt-0.5 text-xs sm:text-base">
                    {product.brand}{product.sku ? ` · SKU: ${product.sku}` : ""}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 grid place-items-center rounded-full border border-gray-200 hover:bg-gray-50"
                  aria-label="Cerrar modal"
                >✕</button>
              </div>

            <div className="mt-1 sm:mt-4 text-lg sm:text-3xl font-semibold text-gray-900">
              ${formatPrice(product.price, locale)}
            </div>

            <div className="mt-2 sm:mt-6">
              <div className="text-sm font-medium mb-2 sm:mb-3">
                Selecciona talles y cantidades:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
                {product.sizes.map(({ label, stock }) => (
                  <div key={label} className="p-2 sm:p-3 rounded-xl border border-gray-200 bg-white">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      {typeof stock === "number" && (
                        <span className="text-[10px] sm:text-[11px] text-gray-500">stock {stock}</span>
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

            <div className="mt-2 mb-12 sm:mb-8" />
          </div>
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 border-t bg-white p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-2 sm:gap-3">
            <div className="flex w-full sm:w-auto justify-between sm:block">
              <div className="px-1 sm:px-2">
                <div className="text-xs text-gray-600">Unidades</div>
                <div className="text-sm sm:text-xl font-semibold tabular-nums">{units}</div>
              </div>
              <div className="px-1 sm:px-2">
                <div className="text-xs text-gray-600">Total aprox.</div>
                <div className="text-sm sm:text-xl font-semibold tabular-nums">${formatPrice(amount, locale)}</div>
              </div>
            </div>
            <div className="flex-1 sm:flex-1" />
            <button
              onClick={onConfirmClick}
              className="w-full sm:w-auto h-8 sm:h-12 px-3 sm:px-5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 text-sm sm:text-base"
              disabled={units === 0}
            >
              ✓ OK – Confirmar
            </button>
          </div>
        </div>
      </div>
      
      {/* Descripción para lectores de pantalla */}
      <p id="qa-desc" className="sr-only">
        Selecciona talles y cantidades. Usa los botones más/menos para ajustar la cantidad de cada talle. 
        El total se actualiza automáticamente. Presiona Escape para cerrar el modal.
      </p>
      
      {/* Sentinelas de foco */}
      <span ref={endTrapRef} tabIndex={0} className="sr-only" />
    </>
  );
}
