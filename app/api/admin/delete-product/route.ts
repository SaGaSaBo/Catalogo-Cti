import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;
  if (!process.env.NEXT_PUBLIC_ADMIN_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // 1) Intentar obtener rutas de imágenes desde columnas comunes
  let imagePaths: string[] = [];
  const { data: prod, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("image_paths")
    .eq("id", id)
    .single();

  if (!prodErr && prod?.image_paths) {
    try { imagePaths = Array.isArray(prod.image_paths) ? prod.image_paths : []; } catch {}
  }

  // 2) Fallback: si existe tabla product_images(path, product_id)
  if (imagePaths.length === 0) {
    const { data: imgs } = await supabaseAdmin
      .from("product_images")
      .select("path")
      .eq("product_id", id);
    if (imgs?.length) imagePaths = imgs.map((r: any) => r.path).filter(Boolean);
  }

  // 3) Borrar archivos de Storage si hay
  if (imagePaths.length) {
    await supabaseAdmin.storage.from("products").remove(imagePaths);
  }

  // 4) Borrar filas relacionadas (si existe la tabla)
  await supabaseAdmin.from("product_images").delete().eq("product_id", id);

  // 5) Borrar el producto
  const { error: delErr } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
