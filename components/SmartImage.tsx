'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  /** Ruta interna del archivo en el bucket (ej: "productos/1234/main.jpg") */
  storagePath: string;
  alt: string;
  // Tamaños recomendados para responsive
  width: number;
  height: number;
  sizes?: string; // ej: "(max-width: 768px) 50vw, 33vw"
  priority?: boolean;
  className?: string;
  // Placeholder opcional mientras llega la url firmada
  placeholderSrc?: string;
};

export default function SmartImage({
  storagePath,
  alt,
  width,
  height,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority = false,
  className,
  placeholderSrc,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ path: storagePath });
        const res = await fetch(`/api/storage/signed-url?${params.toString()}`, { cache: 'force-cache' });
        const json = await res.json();
        if (!cancelled) setSrc(json.url);
      } catch {
        // no-op
      }
    })();
    return () => { cancelled = true; };
  }, [storagePath]);

  // Mientras no tengamos URL, uso placeholder (blur up) o un div vacío
  if (!src && placeholderSrc) {
    return (
      <Image
        src={placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        placeholder="blur"
        blurDataURL={placeholderSrc}
        priority={priority}
      />
    );
  }

  if (!src) {
    return <div className={className} style={{ width, height, background: '#f3f3f3' }} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      // next/image entregará AVIF/WebP si el browser soporta
    />
  );
}
