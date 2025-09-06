import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug: Verificando pedidos en la base de datos...');
    
    // Verificar conexión a Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error consultando pedidos:', error);
      return NextResponse.json({ 
        error: 'Error consultando pedidos', 
        details: error.message 
      }, { status: 500 });
    }

    console.log(`📦 Se encontraron ${orders?.length || 0} pedidos`);
    
    return NextResponse.json({
      success: true,
      count: orders?.length || 0,
      orders: orders || [],
      message: `Se encontraron ${orders?.length || 0} pedidos en la base de datos`
    });
    
  } catch (error) {
    console.error('❌ Error en debug-orders:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
