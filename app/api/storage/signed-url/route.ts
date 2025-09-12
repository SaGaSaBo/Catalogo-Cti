import { NextResponse } from 'next/server';
import { getSignedImageUrl } from '@/lib/supabase.server';

export const runtime = 'edge'; // barato y rápido
export const revalidate = 60;   // 60s para el JSON

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  try {
    const signed = await getSignedImageUrl(path);
    // Cache en CDN 5 minutos para este JSON (no para la imagen firmada en sí)
    return new NextResponse(JSON.stringify({ url: signed }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
