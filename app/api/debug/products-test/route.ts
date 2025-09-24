import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  console.log("[PRODUCTS-TEST] Starting debug test");
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error("[PRODUCTS-TEST] Missing envs", { hasUrl: !!url, hasAnon: !!anon });
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  
  // 🔐 SAME AUTH LOGIC AS /api/products
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'admin123';
  const isAdminRequest = token && token === envKey;

  console.log("[PRODUCTS-TEST] 🔐 AUTH DEBUG:", {
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
      .select("id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at", { count: "exact" });

    // Same logic as /api/products
    if (!isAdminRequest) {
      console.log("[PRODUCTS-TEST] 🚫 Filtering by active=true (not admin request)");
      query = query.eq("active", true);
    } else {
      console.log("[PRODUCTS-TEST] ✅ Admin request - showing all products (including inactive)");
    }

    // Add ordering like the real endpoint
    query = query.order("sort_index", { ascending: true }).order("title", { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error("[PRODUCTS-TEST] Supabase error:", {
        message: error.message, 
        details: (error as any).details, 
        hint: (error as any).hint, 
        code: (error as any).code
      });
      return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
    }

    const result = {
      timestamp: new Date().toISOString(),
      auth: {
        isAdminRequest,
        authLogic: `"${token}" === "${envKey}" = ${token === envKey}`
      },
      query: {
        filteredByActive: !isAdminRequest,
        dataLength: data?.length || 0,
        count: count || 0,
        firstProduct: data?.[0] ? {
          id: data[0].id,
          title: data[0].title,
          active: data[0].active,
          imageUrls: data[0].image_urls,
          hasImages: Array.isArray(data[0].image_urls) && data[0].image_urls.length > 0
        } : null,
        allProducts: data?.map(p => ({
          id: p.id,
          title: p.title,
          active: p.active,
          hasImages: Array.isArray(p.image_urls) && p.image_urls.length > 0
        })) || []
      },
      comparison: {
        expectedBehavior: isAdminRequest ? "Should show ALL products (active and inactive)" : "Should show ONLY active products",
        actualResult: `Found ${data?.length || 0} products, count=${count || 0}`
      }
    };

    console.log("[PRODUCTS-TEST] Query result:", result);

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[PRODUCTS-TEST] Uncaught:", e?.message || e, e?.stack);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message || String(e) }, { status: 500 });
  }
}
