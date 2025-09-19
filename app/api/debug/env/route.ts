import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    runtime: process.env.VERCEL ? "vercel" : "local",
    has: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  });
}