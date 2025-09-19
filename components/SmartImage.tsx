'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { sbRender } from '@/lib/img';

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
  // Usar URL optimizada directamente sin signed URLs
  const optimizedSrc = sbRender(storagePath, { 
    w: width, 
    q: 75, 
    format: "webp" 
  });

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
    />
  );
}