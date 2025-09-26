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
    
    // Parámetros de filtrado del servidor
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const sortBy = url.searchParams.get('sortBy') || 'sort_index';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    // Construir query base
    let query = supabaseAdmin
      .from("products")
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index", { count: "exact" })
      .eq("active", true); // Solo productos activos

    // Aplicar filtro de búsqueda si existe
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Aplicar filtro de categoría si existe
    if (category.trim()) {
      query = query.eq('category_id', category);
    }

    // Aplicar ordenamiento
    const ascending = sortOrder === 'asc';
    if (sortBy === 'price') {
      query = query.order('price', { ascending });
    } else if (sortBy === 'brand') {
      query = query.order('brand', { ascending });
    } else {
      // Por defecto: sort_index, luego title
      query = query.order('sort_index', { ascending: true }).order('title', { ascending });
    }

    // Aplicar paginación después de filtros
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const mapped = (data ?? []).map(mapRow);
    console.log("[API] GET /products ->", count ?? mapped.length, `(page ${page}, limit ${limit}, search: "${search}", category: "${category}")`);
    
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
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    
    return response;
  } catch (e: any) {
    console.error("[API] GET /products ERROR:", e?.message || e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

// POST method removed - use /api/admin/products for creating products
