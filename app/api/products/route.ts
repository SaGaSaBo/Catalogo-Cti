export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50'); // Límite por defecto más alto
    const offset = (page - 1) * limit;

    // Solo campos esenciales para reducir transferencia de datos
    const { data, error, count } = await supabaseAdmin
      .from("products")
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index", { count: "exact" })
      .eq("active", true) // Solo productos activos
      .order("sort_index", { ascending: true })
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const mapped = (data ?? []).map(mapRow);
    console.log("[API] GET /products ->", count ?? mapped.length, `(page ${page}, limit ${limit})`);
    
    const response = NextResponse.json({
      items: mapped,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit)
      }
    });

    // Headers de caché optimizados
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=30');
    
    return response;
  } catch (e: any) {
    console.error("[API] GET /products ERROR:", e?.message || e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

// POST method removed - use /api/admin/products for creating products