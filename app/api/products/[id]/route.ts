export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const json = await req.json();
    if (json.categoryId === "" || json.categoryId === undefined) json.categoryId = null;

    const updated = await supabaseAdmin
      .from('products')
      .update({
        brand: json.brand,
        title: json.title,
        description: json.description,
        sku: json.sku,
        price: json.price,
        category_id: json.categoryId,
        image_urls: json.imageUrls || [],
        active: json.active !== undefined ? json.active : true,
        sort_index: json.sortIndex
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updated.error) throw updated.error;

    console.log("[API] PUT /products/:id imageUrls len ->", updated.data.image_urls?.length ?? 0);
    return NextResponse.json(updated.data);
  } catch (e: any) {
    console.error("[API] PUT /products/:id ERROR:", e?.message || e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}