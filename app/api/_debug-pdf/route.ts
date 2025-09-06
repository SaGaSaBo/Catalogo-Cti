// app/api/_debug-pdf/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Debug: Verificando carga de fuentes TTF...');
    
    // Verificar que las fuentes existen
    const regularPath = fileURLToPath(new URL('./order/pdf/_fonts/Inter-Regular.ttf', import.meta.url));
    const boldPath = fileURLToPath(new URL('./order/pdf/_fonts/Inter-Bold.ttf', import.meta.url));
    
    console.log('📁 Regular path:', regularPath);
    console.log('📁 Bold path:', boldPath);
    
    // Intentar cargar las fuentes
    const regular = readFileSync(regularPath);
    const bold = readFileSync(boldPath);
    
    console.log('✅ Fuentes cargadas exitosamente');
    console.log('📊 Regular size:', regular.length, 'bytes');
    console.log('📊 Bold size:', bold.length, 'bytes');
    
    return NextResponse.json({
      success: true,
      message: 'Fuentes TTF cargadas correctamente',
      regularSize: regular.length,
      boldSize: bold.length,
      regularPath,
      boldPath
    });
    
  } catch (error) {
    console.error('❌ Error cargando fuentes:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}