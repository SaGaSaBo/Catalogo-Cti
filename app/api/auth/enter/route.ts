// app/api/auth/enter/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // explícito por compatibilidad

export async function POST(req: NextRequest) {
  const { pass } = await req.json().catch(() => ({}));
  const SITE_PASS = process.env.SITE_PASS;

  if (!SITE_PASS) {
    return NextResponse.json(
      { ok: false, error: "SITE_PASS no configurada" },
      { status: 500 }
    );
  }
  if (typeof pass !== "string" || pass !== SITE_PASS) {
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
