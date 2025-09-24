import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";           // no cache SSR
export const revalidate = 0;

const SELECT =
`id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
 category:categories(id, name)`;

const SELECT_FALLBACK =
`id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at`;

function num(v: string | null, def: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : def;
}

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error("[/api/products] Missing envs", { hasUrl: !!url, hasAnon: !!anon });
    return NextResponse.json({ error: "Faltan variables de entorno Supabase (URL o ANON KEY)." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const q        = (searchParams.get("q") || "").trim();
  const cat      = searchParams.get("category_id");
  const limit    = num(searchParams.get("limit"), 30);
  const offset   = num(searchParams.get("offset"), 0);
  const sortBy   = searchParams.get("sortBy") || "sort_index";
  const sortDir  = (searchParams.get("sortDir") || "asc").toLowerCase() === "desc" ? false : true;
  
  // 🔍 LOGGING SEGURO - DIAGNÓSTICO DE HEADERS
  console.log("[/api/products] 🔍 Headers completos:", Object.fromEntries(req.headers.entries()));
  console.log("[/api/products] 🔍 Authorization header (lowercase):", req.headers.get('authorization'));
  console.log("[/api/products] 🔍 Authorization header (uppercase):", req.headers.get('Authorization'));
  console.log("[/api/products] 🔍 Content-Type:", req.headers.get('content-type'));
  console.log("[/api/products] 🔍 User-Agent:", req.headers.get('user-agent'));

  // 🔐 VERIFICAR SI ES UNA PETICIÓN DE ADMIN (consistente con /api/categories)
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'admin123';
  const isAdminRequest = token && token === envKey;

  console.log("[/api/products] 🔐 AUTH DEBUG:", {
    hasAuth: !!auth,
    authHeader: auth.substring(0, 20) + '...',
    extractedToken: token,
    envKey: envKey,
    tokenMatches: token === envKey,
    isAdminRequest,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  try {
    let query = supabase
      .from("products")
      .select(SELECT, { count: "exact" });

    // Solo filtrar por active si NO es una petición de admin
    if (!isAdminRequest) {
      console.log("[/api/products] 🚫 Filtering by active=true (not admin request)");
      query = query.eq("active", true);
    } else {
      console.log("[/api/products] ✅ Admin request - showing all products (including inactive)");
    }

    if (cat) query = query.eq("category_id", cat);

    if (q) {
      // buscar por título, marca o sku (ilike = case-insensitive)
      query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    // orden + paginación
    query = query.order(sortBy, { ascending: sortDir }).order("title", { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[/api/products] ⚠️ JOIN query failed:", {
        message: error.message, details: (error as any).details, hint: (error as any).hint, code: (error as any).code
      });
      
      // 🔄 FALLBACK: Try without JOIN
      console.log("[/api/products] 🔄 Falling back to query WITHOUT categories JOIN...");
      let fallbackQuery = supabase
        .from("products")
        .select(SELECT_FALLBACK, { count: "exact" });

      if (!isAdminRequest) {
        fallbackQuery = fallbackQuery.eq("active", true);
      }

      if (cat) fallbackQuery = fallbackQuery.eq("category_id", cat);

      if (q) {
        fallbackQuery = fallbackQuery.or(`title.ilike.%${q}%,brand.ilike.%${q}%,sku.ilike.%${q}%`);
      }

      fallbackQuery = fallbackQuery.order(sortBy, { ascending: sortDir }).order("title", { ascending: true });
      fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);

      const { data: fallbackData, error: fallbackError, count: fallbackCount } = await fallbackQuery;

      if (fallbackError) {
        console.error("[/api/products] ❌ Fallback query also failed:", {
          message: fallbackError.message, details: (fallbackError as any).details, hint: (fallbackError as any).hint, code: (fallbackError as any).code
        });
        return NextResponse.json({ error: "DB_ERROR", message: fallbackError.message }, { status: 500 });
      }

      console.log("[/api/products] ✅ Fallback query succeeded:", {
        dataLength: fallbackData?.length || 0,
        count: fallbackCount,
        isAdmin: isAdminRequest,
        firstProduct: fallbackData?.[0] ? {
          id: fallbackData[0].id,
          title: fallbackData[0].title,
          active: fallbackData[0].active,
          imageUrls: fallbackData[0].image_urls
        } : null
      });

      // Add null category to products from fallback
      const dataWithNullCategory = (fallbackData || []).map(product => ({
        ...product,
        category: null
      }));

      return NextResponse.json(
        { items: dataWithNullCategory, count: fallbackCount ?? 0, offset, limit },
        {
          status: 200,
          headers: {
            "Cache-Control": "s-maxage=60, stale-while-revalidate=600"
          }
        }
      );
    }

    console.log("[/api/products] Query result:", {
      dataLength: data?.length || 0,
      count,
      isAdmin: isAdminRequest,
      firstProduct: data?.[0] ? {
        id: data[0].id,
        title: data[0].title,
        active: data[0].active,
        imageUrls: data[0].image_urls
      } : null
    });

    return NextResponse.json(
      { items: data ?? [], count: count ?? 0, offset, limit },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=600"
        }
      }
    );
  } catch (e: any) {
    console.error("[/api/products] Uncaught:", e?.message || e, e?.stack);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message || String(e) }, { status: 500 });
  }
}
