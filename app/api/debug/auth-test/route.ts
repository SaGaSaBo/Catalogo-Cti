import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  console.log("[DEBUG] Auth test endpoint called");
  
  // Test auth logic (same as /api/products)
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'admin123';
  const isAdmin = token && token === envKey;

  console.log("[DEBUG] Auth check:", {
    hasAuth: !!auth,
    authHeader: auth.substring(0, 20) + (auth.length > 20 ? '...' : ''),
    extractedToken: token,
    envKey: envKey,
    tokenMatches: token === envKey,
    isAdmin
  });

  // Test Supabase connection
  let publicProductsCount = 0;
  let allProductsCount = 0;
  let dbError: string | null = null;
  let products: any[] = [];
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anon) {
      dbError = "Missing Supabase env vars";
    } else {
      // Usar cliente centralizado en lugar de crear nueva instancia
      
      // Test public products (active only)
      const { count: publicCount, error: publicError } = await supabaseAdmin
        .from("products")
        .select("id", { count: "exact" })
        .eq("active", true);
      
      publicProductsCount = publicCount || 0;
      
      // Test all products (admin view)
      const { count: allCount, data: allData, error: allError } = await supabaseAdmin
        .from("products")
        .select("id, title, active, image_urls", { count: "exact" });
      
      allProductsCount = allCount || 0;
      products = allData || [];
      
      dbError = publicError?.message || allError?.message || null;
      
      console.log("[DEBUG] Database results:", {
        publicProductsCount,
        allProductsCount,
        sampleProducts: products.slice(0, 3)
      });
    }
  } catch (e: any) {
    dbError = e.message;
    console.error("[DEBUG] Database error:", e);
  }

  const result = {
    timestamp: new Date().toISOString(),
    runtime: process.env.VERCEL ? "vercel" : "local",
    auth: {
      hasAuthHeader: !!auth,
      authHeaderPreview: auth.substring(0, 20) + (auth.length > 20 ? '...' : ''),
      extractedToken: token,
      envKey: envKey,
      tokenMatches: token === envKey,
      isAdmin,
      adminLogic: `isAdmin = token && token === envKey = "${token}" && "${token}" === "${envKey}" = ${isAdmin}`
    },
    database: {
      publicProductsCount,
      allProductsCount,
      dbError,
      sampleProducts: products.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.title,
        active: p.active,
        hasImages: Array.isArray(p.image_urls) && p.image_urls.length > 0
      }))
    },
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ADMIN_KEY: !!process.env.ADMIN_KEY,
      NODE_ENV: process.env.NODE_ENV
    },
    explanation: {
      expected: "If isAdmin=true, should return allProductsCount. If isAdmin=false, should return publicProductsCount.",
      problem: allProductsCount === 0 ? "No products in database" : (isAdmin ? "Auth logic working, should see all products" : "Not admin, should only see active products")
    }
  };

  console.log("[DEBUG] Final result:", result);
  
  return NextResponse.json(result);
}
