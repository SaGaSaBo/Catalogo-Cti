import { NextResponse } from 'next/server';
import { getSignedImageUrl } from '@/lib/supabase.server';

export const runtime = 'edge';
export const revalidate = 60;

export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  try {
    const url = await getSignedImageUrl(path);
    return new NextResponse(JSON.stringify({ url }), {
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