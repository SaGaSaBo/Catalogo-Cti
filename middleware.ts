// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas (la página de login y los endpoints de auth/debug)
  if (
    pathname.startsWith("/entrar") ||
    pathname.startsWith("/api/auth/enter") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/debug/") ||          // Permitir endpoints de debug
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Si no hay cookie de acceso, redirige a /entrar
  const hasGate = req.cookies.get("site_auth")?.value === "1";
  if (!hasGate) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Excluye explícitamente rutas públicas del matcher para rendimiento
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|entrar|api/auth|api/debug).*)",
  ],
};