'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  storagePath: string; // ej: "productos/sku-123/main-800.webp"
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
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
        const res = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(storagePath)}`, { cache: 'force-cache' });
        const json = await res.json();
        if (!cancelled) setSrc(json.url);
      } catch {/* ignore */}
    })();
    return () => { cancelled = true; };
  }, [storagePath]);

  if (!src) {
    const defaultPlaceholder = '/images/products/placeholder.svg';
    return (
      <Image
        src={placeholderSrc || defaultPlaceholder}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
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
    />
  );
}