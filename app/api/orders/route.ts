import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/supabase-orders';
import { isAdmin } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

// POST - Crear un nuevo pedido
export async function POST(req: NextRequest) {
  try {
    console.log('📝 Creando nuevo pedido...');
    
    const body = await req.json();
    
    // Validar datos requeridos
    if (!body.customer || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Datos de pedido inválidos' }, 
        { status: 400 }
      );
    }

    // Crear el pedido en la base de datos
    const order = await createOrder({
      customer: {
        name: body.customer.name || '',
        email: body.customer.email || '',
        phone: body.customer.phone || ''
      },
      items: body.items,
      total: body.total || 0
    });

    console.log('✅ Pedido creado:', order.id);
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno al crear pedido' }, 
      { status: 500 }
    );
  }
}