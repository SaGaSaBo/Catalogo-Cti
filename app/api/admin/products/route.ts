import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Para admin, obtener TODOS los productos (incluyendo inactivos)
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index,created_at,updated_at")
      .order("sort_index", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    const mapped = (data ?? []).map(mapRow);
    console.log("[API] GET /admin/products ->", mapped.length, "productos (todos, incluyendo inactivos)");
    
    const response = NextResponse.json(mapped);
    
    // Sin caché para admin (datos siempre frescos)
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
