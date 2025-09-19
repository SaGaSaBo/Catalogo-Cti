import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/errors";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing required environment variables:", {
    hasUrl: !!url,
    hasServiceKey: !!serviceKey
  });
}

const supabaseAdmin = url && serviceKey 
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null;

export async function POST(req: Request) {
  // Verificar configuración de Supabase
  if (!supabaseAdmin) {
    return NextResponse.json({ 
      error: "Supabase not configured. Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL" 
    }, { status: 500 });
  }

  // Autorización simple desde el cliente (mejoraremos luego con sesión)
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;
  if (!process.env.NEXT_PUBLIC_ADMIN_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Obtener rutas de imágenes si están en products.image_paths
  let imagePaths: string[] = [];
  const { data: prod } = await supabaseAdmin
    .from("products")
    .select("image_paths")
    .eq("id", id)
    .single();

  if (prod?.image_paths && Array.isArray(prod.image_paths)) imagePaths = prod.image_paths;

  // Fallback si existe tabla product_images(path, product_id)
  if (imagePaths.length === 0) {
    const { data: imgs } = await supabaseAdmin
      .from("product_images")
      .select("path")
      .eq("product_id", id);
    if (imgs?.length) imagePaths = imgs.map((r: any) => r.path).filter(Boolean);
  }

  if (imagePaths.length) {
    await supabaseAdmin.storage.from("products").remove(imagePaths);
  }

  await supabaseAdmin.from("product_images").delete().eq("product_id", id);
  const { error: delErr } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (delErr) {
    const msg = getErrorMessage(delErr);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}