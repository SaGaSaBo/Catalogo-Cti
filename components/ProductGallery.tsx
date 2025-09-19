"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sbRender } from "@/lib/img";

type Props = {
  images: string[];         // URLs públicas (ej: Supabase getPublicUrl)
  alt?: string;
  className?: string;
};

export default function ProductGallery({ images, alt = "Producto", className = "" }: Props) {
  const valid = Array.isArray(images) ? images.filter(Boolean) : [];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const hasImages = valid.length > 0;
  const safeIndex = Math.min(index, Math.max(0, valid.length - 1));
  const current = hasImages ? valid[safeIndex] : undefined;

  const prev = useCallback(() => setIndex((i) => (i - 1 + valid.length) % valid.length), [valid.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % valid.length), [valid.length]);

  // Preload vecinos
  useEffect(() => {
    if (!hasImages) return;
    const preload = (src: string) => { const img = new window.Image(); img.src = src; };
    preload(valid[(safeIndex + 1) % valid.length]);
    preload(valid[(safeIndex - 1 + valid.length) % valid.length]);
  }, [safeIndex, valid, hasImages]);

  // Keyboard nav en lightbox
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    // bloquear scroll del body
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, next, prev]);

  if (!hasImages) {
    return (
      <div className={`aspect-square w-full rounded-2xl bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-sm text-gray-400">Sin imágenes</span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Imagen principal */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
        <Image
          src={sbRender(current!, { w: 1200, q: 80, format: "webp" })}
          alt={alt}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-contain cursor-zoom-in"
          onClick={() => setOpen(true)}
          loading="eager"
        />
        {/* Flechas en desktop */}
        {valid.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Anterior"
            >‹</button>
            <button
              onClick={next}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Siguiente"
            >›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {valid.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {valid.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border ${i === safeIndex ? "ring-2 ring-black" : ""}`}
              aria-label={`Imagen ${i + 1}`}
            >
              <Image src={sbRender(src, { w: 64, q: 60, format: "webp" })} alt={`${alt} miniatura ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-[120] isolate">
          <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
          <div className="relative mx-auto mt-10 w-[min(96vw,1100px)]">
            <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
              <Image
                src={sbRender(current!, { w: 1200, q: 80, format: "webp" })}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain select-none"
                loading="eager"
              />
              {valid.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow"
                    aria-label="Anterior"
                  >‹</button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow"
                    aria-label="Siguiente"
                  >›</button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 h-10 px-3 rounded-lg bg-white/90 hover:bg-white text-sm font-medium shadow"
                aria-label="Cerrar"
              >
                Cerrar
              </button>
              <div className="absolute left-3 top-3 text-xs text-white/80 bg-white/10 backdrop-blur px-2 py-1 rounded">
                {safeIndex + 1} / {valid.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
