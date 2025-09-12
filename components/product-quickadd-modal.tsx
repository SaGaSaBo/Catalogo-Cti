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
        className="flex-1 text-center text-sm sm:text-base font-medium bg-transparent border-0 focus:outline-none"
        aria-label="Cantidad"
        disabled={disabled}
      />

      <button
        type="button" onClick={inc} disabled={disabled || value >= max}
        className="h-full w-8 sm:w-10 grid place-items-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 touch-manipulation"
        aria-label="Aumentar"
      >+</button>
    </div>
  );
}

export default function ProductQuickAddModal({
  open, onClose, product, onConfirm,
}: {
  open: boolean; onClose: () => void; product: QuickAddProduct | null; onConfirm: (items: Array<{ size: string; qty: number }>) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Referencias para accesibilidad
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startTrapRef = useRef<HTMLSpanElement>(null);
  const endTrapRef = useRef<HTMLSpanElement>(null);

  // Inicializar cantidades
  useEffect(() => {
    if (!product) return;
    const initial: Record<string, number> = {};
    product.sizes.forEach((s) => { initial[s.label] = s.initial || 0; });
    setQuantities(initial);
  }, [product]);

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

  // Scroll lock
  useEffect(() => {
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => unlockBodyScroll();
  }, [open]);

  const updateQuantity = useCallback((size: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [size]: qty }));
  }, []);

  const units = useMemo(() => Object.values(quantities).reduce((a, b) => a + b, 0), [quantities]);
  const amount = useMemo(() => {
    if (!product) return 0;
    return Object.entries(quantities).reduce((sum, [size, qty]) => {
      return sum + (qty * product.price);
    }, 0);
  }, [quantities, product]);

  const onConfirmClick = useCallback(() => {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => ({ size, qty }));
    onConfirm(items);
    onClose();
  }, [quantities, onConfirm, onClose]);

  const onOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    // iOS fix: evitar que el touch fuera del modal arrastre el body
    e.preventDefault();
  }, []);

  if (!open || !product) return null;

  return (
    <>
      {/* Sentinelas de foco */}
      <span ref={startTrapRef} tabIndex={0} className="sr-only" />
      
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        onClick={(e) => e.target === overlayRef.current && onClose()}
        onTouchMove={onOverlayTouchMove}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-title"
          aria-describedby="qa-desc"
          className="w-full h-full sm:max-w-5xl sm:max-h-[90vh] bg-white flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div className="flex-1 min-w-0">
              <h2 id="qa-title" className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {product.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span>{product.brand}</span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{product.sku}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-lg"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="p-4 sm:p-6">
              {/* Galería compacta */}
              {product.images && product.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {product.images.slice(0, 6).map((img, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={img}
                          alt={`${product.title} - Imagen ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de talles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar talles</h3>
                <div className="space-y-3">
                  {product.sizes.map((size) => (
                    <div key={size.label} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-16 sm:w-20 text-sm sm:text-base font-medium text-gray-700">
                        {size.label}
                      </div>
                      <div className="flex-1">
                        <Stepper
                          value={quantities[size.label] || 0}
                          onChange={(qty) => updateQuantity(size.label, qty)}
                          max={size.stock || 999}
                          disabled={!size.stock}
                        />
                      </div>
                      {size.stock !== undefined && (
                        <div className="flex-shrink-0 text-xs sm:text-sm text-gray-500">
                          Stock: {size.stock}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Total ({units} unidades)</div>
                  <div className="text-sm sm:text-xl font-semibold tabular-nums">${formatPrice(amount, "es-CL")}</div>
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