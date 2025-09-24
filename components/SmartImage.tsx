'use client';
import UiImg from '@/components/UiImg';

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
  return (
    <UiImg
      src={storagePath}
      alt={alt}
      width={width}
      height={height}
      className={className}
      transform={{ width, quality: 75, format: "webp" }}
    />
  );
}