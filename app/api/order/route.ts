import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/supabase-orders';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar datos requeridos
    if (!body.customer || !body.items || !body.total) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requieren customer, items y total.' },
        { status: 400 }
      );
    }

    // Crear la orden en Supabase
    const order = await createOrder({
      customer: body.customer,
      items: body.items,
      total: body.total
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno al crear la orden' },
      { status: 500 }
    );
  }
}