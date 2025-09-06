import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Simple Test: Verificando conexión con Supabase...');
    
    // Verificar si podemos leer de la tabla orders
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error leyendo orders:', error);
      return NextResponse.json({
        success: false,
        error: 'Error leyendo orders',
        details: error
      }, { status: 500 });
    }

    console.log('✅ Conexión con Supabase exitosa');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión con Supabase exitosa',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error en simple test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
