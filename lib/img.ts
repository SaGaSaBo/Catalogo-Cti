export const sbBase = () => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/+$/, "");
};

// Normaliza: acepta URL completa o path; devuelve solo el path relativo en Storage
// Ejemplos de entrada:
//  - "products/abc.jpg"
//  - "https://...supabase.co/storage/v1/object/public/products/abc.jpg"
//  - "https://...supabase.co/storage/v1/render/image/public/products/abc.jpg?width=1200&quality=80"
export function toStoragePath(input?: string): string {
  if (!input) return "";
  try {
    // Si ya parece un path
    if (!/^https?:\/\//i.test(input)) {
      return input.replace(/^\/+/, "");
    }
    const url = new URL(input);
    const m = url.pathname.match(/\/storage\/v1\/(?:render\/image|object)\/public\/(.+)$/);
    if (m?.[1]) return m[1]; // "products/abc.jpg"
    return input; // fallback: deja pasar tal cual
  } catch {
    return input;
  }
}

// Construye la URL de Supabase Render (transformación) SIN firmas
type Opts = { w?: number; h?: number; q?: number; format?: "webp" | "avif" };
export function sbRenderPath(path: string, opts: Opts = {}) {
  const base = sbBase();
  const p = new URLSearchParams();
  if (opts.w) p.set("width", String(opts.w));
  if (opts.h) p.set("height", String(opts.h));
  p.set("quality", String(opts.q ?? 75));
  if (opts.format) p.set("format", opts.format);
  return `${base}/storage/v1/render/image/public/${path.replace(/^\/+/, "")}?${p.toString()}`;
}

// Por si necesitas la URL pública original (no transformada)
export function sbPublicPath(path: string) {
  const base = sbBase();
  return `${base}/storage/v1/object/public/${path.replace(/^\/+/, "")}`;
}

// Legacy functions for backward compatibility
export const sbPublicImage = (path: string) => {
  return sbPublicPath(`products/${path}`);
};

export const sbRender = (path: string, opts: Opts = {}) => {
  return sbRenderPath(`products/${path}`, opts);
};
