export const sbPublicImage = (path: string) => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // URL pública directa (ORIGINAL) — evitar usar esta en el catálogo
  return `${base}/storage/v1/object/public/products/${path}`;
};

type Opts = { w?: number; h?: number; q?: number; format?: "webp" | "avif" };
export const sbRender = (path: string, opts: Opts = {}) => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const p = new URLSearchParams();
  if (opts.w) p.set("width", String(opts.w));
  if (opts.h) p.set("height", String(opts.h));
  p.set("quality", String(opts.q ?? 75));
  if (opts.format) p.set("format", opts.format);
  // CDN de Supabase con transformación — CACHÉ COMPARTIDA
  return `${base}/storage/v1/render/image/public/products/${path}?${p.toString()}`;
};
