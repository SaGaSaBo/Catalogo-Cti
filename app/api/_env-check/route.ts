import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ADMIN_KEY: process.env.ADMIN_KEY ? 'Configurado' : 'No configurado',
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY ? 'Configurado' : 'No configurado',
    DATA_PROVIDER: process.env.DATA_PROVIDER ? 'Configurado' : 'No configurado',
    timestamp: new Date().toISOString()
  });
}