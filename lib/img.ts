export const sbBase = () => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return base.replace(/\/+$/, "");
};

export function isDataOrBlob(input?: string): boolean {
  if (!input) return false;
  return /^data:|^blob:/i.test(input);
}

export function isHttpUrl(input?: string): boolean {
  if (!input) return false;
  return /^https?:\/\//i.test(input);
}

export function isSupabaseUrl(input?: string): boolean {
  if (!isHttpUrl(input)) return false;
  try {
    const u = new URL(input!);
    return /\.supabase\.co$/i.test(u.hostname) && /\/storage\/v1\//.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Extrae el path de Storage desde:
 *  - /storage/v1/object/public/<path>
 *  - /storage/v1/render/image/public/<path>
 * Si no matchea, devuelve null.
 */
export function extractStoragePathFromSupabaseUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/storage\/v1\/(?:render\/image|object)\/public\/(.+)$/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Normaliza un src arbitrario a una de tres clases:
 * - { kind: 'storage', path }      → transformable (render/image)
 * - { kind: 'external', url }      → usar tal cual (unoptimized)
 * - { kind: 'data', url }          → usar tal cual (unoptimized)
 */
export function classifySrc(input?: string):
  | { kind: 'storage'; path: string }
  | { kind: 'external'; url: string }
  | { kind: 'data'; url: string }
  | null {
  if (!input) return null;

  if (isDataOrBlob(input)) {
    return { kind: 'data', url: input };
  }

  if (isSupabaseUrl(input)) {
    const path = extractStoragePathFromSupabaseUrl(input);
    if (path) return { kind: 'storage', path };
    // Si es supabase pero no storage path, tratar como externa
    return { kind: 'external', url: input };
  }

  if (isHttpUrl(input)) {
    return { kind: 'external', url: input };
  }

  // Si no es http(s)/data/blob, tratamos como path de Storage
  return { kind: 'storage', path: input.replace(/^\/+/, "") };
}

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

// Legacy function for backward compatibility
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
