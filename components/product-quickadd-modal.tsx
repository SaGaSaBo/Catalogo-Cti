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
  const [showImages, setShowImages] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const images = product.images?.length ? product.images : [""];
  const contentRef = useRef<HTMLDivElement>(null);

  const onConfirmClick = useCallback(() => {
    onConfirm({ productId: product.id, quantities: qty, units, amount });
    onClose();
  }, [onConfirm, product.id, qty, units, amount, onClose]);

  // Detectar scroll del contenedor del modal para ocultar/mostrar imágenes en mobile
  useEffect(() => {
    if (!open || !contentRef.current) return;

    const contentElement = contentRef.current;
    let ticking = false;
    let lastScrollTop = 0;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = contentElement.scrollTop;
          setScrollY(scrollTop);
          
          // En mobile, ocultar imágenes cuando se hace scroll hacia abajo
          if (window.innerWidth < 640) { // sm breakpoint
            const scrollDelta = scrollTop - lastScrollTop;
            
            // Solo cambiar estado si hay un cambio significativo
            if (Math.abs(scrollDelta) > 10) {
              if (scrollDelta > 0 && scrollTop > 150) {
                // Scrolling down - hide images
                setShowImages(false);
              } else if (scrollDelta < 0 && scrollTop < 100) {
                // Scrolling up - show images
                setShowImages(true);
              }
              lastScrollTop = scrollTop;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    contentElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => contentElement.removeEventListener('scroll', handleScroll);
  }, [open]);

  // Resetear estado de imágenes cuando se abre el modal
  useEffect(() => {
    if (open) {
      setShowImages(true);
      setScrollY(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-start sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true" role="dialog"
    >
      <div className="w-full h-full sm:max-w-5xl sm:max-h-[90vh] sm:rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Contenedor scrolleable completo */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {/* Galería - Sticky en mobile */}
          <div className={`p-2 sm:p-6 lg:p-8 bg-gray-50 transition-all duration-500 ease-in-out ${
            showImages ? 'block opacity-100 transform translate-y-0' : 'hidden sm:block sm:opacity-100 sm:transform sm:translate-y-0'
          }`}>
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
                <h2 className="text-sm sm:text-xl lg:text-2xl font-bold leading-tight">{product.title}</h2>
                <div className="text-gray-500 mt-0.5 text-xs sm:text-base">
                  {product.brand}{product.sku ? ` · SKU: ${product.sku}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Botón para mostrar/ocultar imágenes en mobile */}
                <button
                  onClick={() => setShowImages(!showImages)}
                  className="sm:hidden h-7 w-7 flex-shrink-0 grid place-items-center rounded-full border border-gray-200 hover:bg-gray-50 text-xs transition-colors"
                  aria-label={showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                  title={showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                >
                  {showImages ? "📷" : "👁️"}
                </button>
                <button
                  onClick={onClose}
                  className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 grid place-items-center rounded-full border border-gray-200 hover:bg-gray-50"
                  aria-label="Cerrar"
                >✕</button>
              </div>
            </div>

            <div className="mt-1 sm:mt-4 text-lg sm:text-3xl font-semibold text-gray-900">
              ${formatPrice(product.price, locale)}
            </div>

            <div className="mt-2 sm:mt-6">
              <div className="text-sm font-medium mb-2 sm:mb-3">
                Selecciona talles y cantidades:
                {/* Debug info - solo en mobile */}
                <span className="sm:hidden text-xs text-gray-400 ml-2">
                  (scroll: {Math.round(scrollY)}px)
                </span>
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
    </div>
  );
}
