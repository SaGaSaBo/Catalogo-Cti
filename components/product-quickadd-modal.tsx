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
  description?: string;
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
        className="h-full flex-1 text-center text-sm font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
        aria-label="Cantidad"
        min={min}
        max={max}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
      />

      <button
        type="button" onClick={inc} disabled={disabled || value >= max}
        className="h-full w-8 sm:w-10 grid place-items-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 touch-manipulation"
        aria-label="Aumentar"
      >+</button>
    </div>
  );
}

// Componente principal
export function ProductQuickAddModal({
  product, isOpen, onClose, onAddToCart,
}: {
  product: QuickAddProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (items: Array<{ size: string; qty: number }>) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const startTrapRef = useRef<HTMLSpanElement>(null);
  const endTrapRef = useRef<HTMLSpanElement>(null);

  // Inicializar cantidades
  useEffect(() => {
    if (product) {
      const initial: Record<string, number> = {};
      product.sizes.forEach(s => {
        initial[s.label] = s.initial || 0;
      });
      setQuantities(initial);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Lock scroll cuando está abierto
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      // Focus en el modal
      setTimeout(() => {
        startTrapRef.current?.focus();
      }, 100);
    } else {
      unlockBodyScroll();
    }
    return () => unlockBodyScroll();
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Manejar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calcular total
  const total = useMemo(() => {
    if (!product) return 0;
    return product.sizes.reduce((sum, size) => {
      const qty = quantities[size.label] || 0;
      return sum + (qty * product.price);
    }, 0);
  }, [product, quantities]);

  // Cambiar cantidad
  const updateQuantity = useCallback((size: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [size]: qty }));
  }, []);

  // Agregar al carrito
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    const items = product.sizes
      .filter(size => (quantities[size.label] || 0) > 0)
      .map(size => ({ size: size.label, qty: quantities[size.label] || 0 }));
    
    if (items.length > 0) {
      onAddToCart(items);
      onClose();
    }
  }, [product, quantities, onAddToCart, onClose]);

  // Cambiar imagen
  const nextImage = useCallback(() => {
    if (!product?.images) return;
    setCurrentImageIndex(prev => (prev + 1) % product.images!.length);
  }, [product?.images]);

  const prevImage = useCallback(() => {
    if (!product?.images) return;
    setCurrentImageIndex(prev => (prev - 1 + product.images!.length) % product.images!.length);
  }, [product?.images]);

  if (!isOpen || !product) return null;

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images![currentImageIndex] : null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qa-title"
        aria-describedby="qa-desc"
      >
        {/* Modal */}
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex-1 min-w-0">
              <h2 id="qa-title" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {product.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {product.brand} {product.sku && `• ${product.sku}`}
              </p>
              {/* Descripción completa */}
              {product.description && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden">
            {/* Imagen */}
            {hasImages && (
              <div className="lg:w-1/2 p-4 sm:p-6">
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {currentImage && (
                    <img
                      src={currentImage}
                      alt={`${product.title} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Navegación de imágenes */}
                  {product.images!.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                        aria-label="Imagen anterior"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                        aria-label="Imagen siguiente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Indicadores */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {product.images!.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Formulario */}
            <div className={`${hasImages ? 'lg:w-1/2' : 'w-full'} p-4 sm:p-6 flex flex-col`}>
              {/* Precio */}
              <div className="mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">Precio unitario</div>
              </div>

              {/* Talles y cantidades */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Selecciona talles y cantidades</h3>
                
                <div className="space-y-3">
                  {product.sizes.map((size) => (
                    <div key={size.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{size.label}</div>
                        {size.stock !== undefined && (
                          <div className="text-sm text-gray-500">
                            Stock: {size.stock}
                          </div>
                        )}
                      </div>
                      <div className="w-24">
                        <Stepper
                          value={quantities[size.label] || 0}
                          onChange={(qty) => updateQuantity(size.label, qty)}
                          max={size.stock || 999}
                          disabled={size.stock === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total y botón */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${formatPrice(total)}
                  </span>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={total === 0}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Agregar al Carrito
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
      <span ref={startTrapRef} tabIndex={0} className="sr-only" />
      <span ref={endTrapRef} tabIndex={0} className="sr-only" />
    </>
  );
}