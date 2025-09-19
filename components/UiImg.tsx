"use client";
import Image, { ImageProps } from "next/image";
import { sbRenderPath, toStoragePath } from "@/lib/img";

type UiImgProps = Omit<ImageProps, "src"> & {
  // Acepta path o URL completa
  src: string;
  // Opciones de transformación (se mapearán a Supabase)
  widthHint?: number; // ancho objetivo para el render server-side
  qualityHint?: number; // 60-85 recomendado
  format?: "webp" | "avif";
  useOriginal?: boolean; // si true, usa object/public en vez de render/image
};

export default function UiImg({
  src,
  widthHint = 400,
  qualityHint = 75,
  format = "webp",
  useOriginal = false,
  sizes = "(max-width:768px) 100vw, 50vw",
  loading = "lazy",
  priority = false,
  ...rest
}: UiImgProps) {
  const path = toStoragePath(src);
  const finalSrc = useOriginal
    ? src // si vino URL completa que NO quieras transformar
    : sbRenderPath(path, { w: widthHint, q: qualityHint, format });

  return (
    <Image
      {...rest}
      // ⛔️ Clave: evitamos _next/image → no hay ?url=...
      unoptimized
      src={finalSrc}
      sizes={sizes}
      loading={loading}
      priority={priority}
    />
  );
}
