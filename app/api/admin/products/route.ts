import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    console.log("[API] POST /admin/products - Creating product:", {
      brand: body.brand,
      title: body.title,
      sku: body.sku,
      price: body.price,
      active: body.active,
      imageUrlsLength: body.imageUrls?.length || 0,
      categoryId: body.categoryId
    });

    // Validaciones básicas
    if (!body.brand || !body.title || !body.sku || !body.price) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: brand, title, sku, price' },
        { status: 400 }
      );
    }

    // Crear el producto (mapear camelCase → snake_case)
    const productData = {
      brand: body.brand.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || null,
      sku: body.sku.trim(),
      price: parseFloat(body.price),
      sizes: Array.isArray(body.sizes) ? body.sizes.map((s: string) => s.trim()) : [],
      image_urls: Array.isArray(body.imageUrls) ? body.imageUrls.filter((url: string) => url && url.trim()) : [],
      active: body.active !== undefined ? body.active : true,
      category_id: body.categoryId?.trim() || null,
      sort_index: body.sortIndex || 1
    };

    console.log("[API] POST /admin/products - Creating product with data:", {
      ...productData,
      image_urls: `[${productData.image_urls.length} images]`
    });

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index,created_at,updated_at")
      .single();

    if (error) {
      console.error("[API] POST /admin/products - Supabase error:", {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code
      });
      return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
    }

    console.log("[API] POST /admin/products - Product created successfully:", {
      id: data.id,
      title: data.title,
      imageUrls: data.image_urls?.length || 0
    });

    // Invalidar caché del catálogo público para que se actualice
    try {
      revalidatePath('/');
      revalidatePath('/api/products');
      console.log("[API] POST /admin/products - Cache invalidated for catalog");
    } catch (revalidateError) {
      console.warn("[API] POST /admin/products - Cache invalidation failed:", revalidateError);
    }

    return NextResponse.json(mapRow(data), { status: 201 });
  } catch (e: any) {
    console.error("[API] POST /admin/products - Uncaught error:", e?.message || e, e?.stack);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message || String(e) }, { status: 500 });
  }
}
