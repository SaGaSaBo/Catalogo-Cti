import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Test: Intentando crear pedido de prueba...');
    
    // Crear un pedido de prueba simple
    const testOrder = {
      order_number: `TEST-${Date.now()}`,
      customer_name: 'Cliente de Prueba',
      customer_email: 'test@example.com',
      customer_phone: '123456789',
      status: 'recibido' as const,
      total_amount: 100,
      order_data: {
        schemaVersion: 1,
        customer: {
          name: 'Cliente de Prueba',
          email: 'test@example.com',
          phone: '123456789'
        },
        items: [{
          id: 'test-1',
          title: 'Producto de Prueba',
          brand: 'Marca Test',
          sku: 'SKU-TEST',
          size: 'M',
          quantity: 1,
          price: 100,
          total: 100
        }],
        total: 100,
        computedTotal: 100,
        itemCount: 1,
        createdAt: new Date().toISOString()
      },
      pdf_data: null
    };

    console.log('📝 Datos del pedido de prueba:', testOrder);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error en test de pedido:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Pedido de prueba creado exitosamente:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido de prueba creado exitosamente',
      order: data
    });
    
  } catch (error) {
    console.error('❌ Error en test de pedido:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
