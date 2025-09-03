import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'admin123';
  
  return NextResponse.json({
    hasAuthHeader: !!req.headers.get('authorization'),
    authHeader: req.headers.get('authorization'),
    extractedToken: token,
    envKey: envKey,
    tokenMatches: token === envKey,
    isAdminResult: isAdmin(req),
    nodeEnv: process.env.NODE_ENV,
    allHeaders: Object.fromEntries(req.headers.entries())
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
