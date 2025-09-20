"use client";
import Image, { ImageProps } from "next/image";
import { classifySrc, sbRenderPath, sbPublicPath } from "@/lib/img";
import { useState, useMemo } from "react";

type UiImgProps = Omit<ImageProps, "src"> & {
  src: string;
  widthHint?: number;
  qualityHint?: number;
  format?: "webp" | "avif";
  fallbackSrc?: string; // opcional: una imagen de reserva
};

export default function UiImg({
  src,
  widthHint = 400,
  qualityHint = 75,
  format = "webp",
  fallbackSrc,
  sizes = "(max-width:768px) 100vw, 50vw",
  loading = "lazy",
  priority = false,
  ...rest
}: UiImgProps) {
  const [errored, setErrored] = useState(false);

  const finalSrc = useMemo(() => {
    const cls = classifySrc(src);
    if (!cls) return "";

    if (cls.kind === "storage") {
      // Transformable en Supabase
      return sbRenderPath(cls.path, { w: widthHint, q: qualityHint, format });
    }

    // data:/blob:/https externo → usar tal cual, sin _next/image
    return cls.url;
  }, [src, widthHint, qualityHint, format]);

  const handleError = () => {
    if (!errored) {
      console.warn("[UiImg] load error:", { src, finalSrc });
      setErrored(true);
    }
  };

  const srcToUse =
    errored && fallbackSrc
      ? fallbackSrc
      : finalSrc;

  return (
    <Image
      {...rest}
      unoptimized
      src={srcToUse}
      sizes={sizes}
      loading={loading}
      priority={priority}
      onError={handleError}
    />
  );
}
