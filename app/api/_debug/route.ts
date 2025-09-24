// app/api/_debug/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function mask(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return { host: u.host, db: u.pathname.replace("/", ""), proto: u.protocol };
  } catch { return "unparseable"; }
}

export async function GET() {
  try {
    // Contar productos
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;

    // Obtener primer producto
    const { data: first, error: firstError } = await supabaseAdmin
      .from('products')
      .select('id, title, image_urls')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (firstError && firstError.code !== 'PGRST116') throw firstError;

    // Datos de conexión (no exponemos credenciales)
    const envInfo = mask(process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Verificar conexión a Supabase
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('products')
      .select('count')
      .limit(1);

    return NextResponse.json({
      ok: true,
      envDB: envInfo,   // host y nombre DB
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET',
      productCount: count || 0,
      sample: first || null,
      healthCheck: healthError ? `ERROR: ${healthError.message}` : 'OK'
    });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? String(e),
      stack: e?.stack 
    }, { status: 500 });
  }
}
