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

export async function POST(req: Request) {
  console.log("[/api/products] POST - Creating new product");
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error("[/api/products] Missing envs", { hasUrl: !!url, hasAnon: !!anon });
    return NextResponse.json({ error: "Faltan variables de entorno Supabase (URL o ANON KEY)." }, { status: 500 });
  }

  // 🔐 VERIFICAR AUTORIZACIÓN ADMIN
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'admin123';
  const isAdminRequest = token && token === envKey;

  console.log("[/api/products] POST - Auth check:", {
    hasAuth: !!auth,
    authHeader: auth.substring(0, 20) + '...',
    extractedToken: token,
    envKey: envKey,
    tokenMatches: token === envKey,
    isAdminRequest
  });

  if (!isAdminRequest) {
    console.log("[/api/products] POST - Unauthorized request");
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("[/api/products] POST - Request body:", {
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

    console.log("[/api/products] POST - Creating product with data:", {
      ...productData,
      image_urls: `[${productData.image_urls.length} images]`
    });

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select("id,brand,title,description,sku,price,sizes,image_urls,active,category_id,sort_index,created_at,updated_at")
      .single();

    if (error) {
      console.error("[/api/products] POST - Supabase error:", {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code
      });
      return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
    }

    console.log("[/api/products] POST - Product created successfully:", {
      id: data.id,
      title: data.title,
      imageUrls: data.image_urls?.length || 0
    });

    return NextResponse.json(mapRow(data), { status: 201 });
  } catch (e: any) {
    console.error("[/api/products] POST - Uncaught error:", e?.message || e, e?.stack);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message || String(e) }, { status: 500 });
  }
}