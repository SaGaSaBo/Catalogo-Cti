import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";           // no cache SSR
export const revalidate = 0;

const SELECT =
`id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
 category:categories(id, name)`;

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

  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  try {
    let query = supabase
      .from("products")
      .select(SELECT, { count: "exact" })
      .eq("active", true);

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
      console.error("[/api/products] Supabase error:", {
        message: error.message, details: (error as any).details, hint: (error as any).hint, code: (error as any).code
      });
      return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
    }

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