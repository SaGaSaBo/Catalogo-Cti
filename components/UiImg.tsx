"use client";
import * as React from "react";
import { buildSupabaseImageUrl } from "@/lib/supa-image";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  transform?: { width?: number; quality?: number; format?: "webp" | "jpeg" | "png" | "avif" };
};

export default function UiImg({ src, alt, transform = { width: 400, quality: 75, format: "webp" }, ...rest }: Props) {
  const finalSrc = buildSupabaseImageUrl(src, transform);
  const [currentSrc, setCurrentSrc] = React.useState(finalSrc);

  return (
    <img
      {...rest}
      alt={alt}
      src={currentSrc}
      loading="lazy" // Lazy loading para reducir carga inicial
      onError={() => {
        // Fallback al original si la transformada falla
        if (currentSrc !== src) setCurrentSrc(src);
      }}
    />
  );
}