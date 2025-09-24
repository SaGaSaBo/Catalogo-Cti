export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const mapRow = (r: any) => ({
  id: r.id,
  brand: r.brand,
  title: r.title,
  description: r.description ?? r.desc ?? r.details ?? "",
  sku: r.sku,
  price: r.price,
  sizes: r.sizes ?? [],
  imageUrls: r.image_urls ?? [],
  active: r.active ?? true,
  categoryId: r.category_id ?? null,
  sortIndex: r.sort_index ?? 0,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();

    const payload = {
      brand: json.brand,
      title: json.title,
      description: json.description,
      sku: json.sku,
      price: json.price,
      sizes: json.sizes ?? null,
      category_id: json.categoryId ?? null,
      image_urls: json.imageUrls ?? [],
      active: typeof json.active === "boolean" ? json.active : true,
      sort_index: json.sortIndex ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index,created_at,updated_at")
      .single();

    if (error) throw error;

    console.log("[API] PUT /products/:id imageUrls len ->", data.image_urls?.length ?? 0);
    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    console.error("[API] PUT /products/:id ERROR:", e?.message || e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}