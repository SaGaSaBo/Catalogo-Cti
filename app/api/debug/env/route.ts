import { NextResponse } from "next/server";

export async function GET() {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAdminSecret = !!process.env.NEXT_PUBLIC_ADMIN_SECRET; // solo para autorizar desde el cliente

  // Nunca devolvemos las claves, solo flags booleanos
  return NextResponse.json({
    runtime: process.env.VERCEL ? "vercel" : "local",
    hasServiceKey,
    hasUrl,
    hasAdminSecret,
    // pista mínima: longitud (no el valor) para depurar si se está inyectando
    lens: {
      service: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
      admin: process.env.NEXT_PUBLIC_ADMIN_SECRET?.length ?? 0,
    }
  });
}