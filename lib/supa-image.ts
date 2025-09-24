export type TransformOpts = {
  width?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif";
};

export function buildSupabaseImageUrl(publicUrl: string, t?: TransformOpts) {
  if (!publicUrl) return publicUrl;
  try {
    const u = new URL(publicUrl);
    const isObjectPublic = u.pathname.includes("/storage/v1/object/public/");
    // Si no es una URL pública de Supabase o no hay transformaciones, dejarla igual
    if (!isObjectPublic || !t) return publicUrl;

    // Cambiar endpoint para usar transformaciones
    u.pathname = u.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    );

    if (t.width) u.searchParams.set("width", String(t.width));
    if (t.quality) u.searchParams.set("quality", String(t.quality));
    if (t.format) u.searchParams.set("format", t.format);

    return u.toString();
  } catch {
    return publicUrl;
  }
}
