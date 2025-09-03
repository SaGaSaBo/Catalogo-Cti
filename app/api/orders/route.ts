import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/supabase-orders';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('📋 Solicitando lista de pedidos...');
    
    // Verificar autorización de administrador
    if (!isAdmin(req)) {
      console.log('❌ No autorizado para acceder a pedidos');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ Autorización válida, obteniendo pedidos...');
    const orders = await getOrders();
    console.log(`📦 Se encontraron ${orders.length} pedidos`);
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}