// app/api/_debug/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error, count } = await supabaseAdmin
      .from("products")
      .select("id,image_urls", { count: "exact" })
      .limit(1);

    if (error) throw error;

    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    return NextResponse.json({
      ok: true,
      supabase: {
        urlHost: new URL(supaUrl).host,
        projectRef: supaUrl.replace("https://", "").split(".")[0],
        anonSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceSet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      productCount: count ?? data?.length ?? 0,
      sample: data?.[0] ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}