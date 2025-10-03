import { NextResponse } from 'next/server';
import { createOrder as createSupabaseOrder } from '@/lib/supabase-orders';
import { createOrder as createFileOrder } from '@/lib/fs-orders';
import { validateOrderPayload } from '@/lib/validation';
import { OrderPayload } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Intentar crear en Supabase primero
    try {
      // Validar datos requeridos para Supabase
      if (!body.customer || !body.items || !body.total) {
        throw new Error('Datos incompletos para Supabase');
      }

      // Crear la orden en Supabase
      const order = await createSupabaseOrder({
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
    } catch (supabaseError) {
      console.warn('Supabase order creation failed, falling back to file system:', supabaseError);
      
      // Fallback: crear en sistema de archivos
      const validation = validateOrderPayload(body);
      if (!validation.ok) {
        return NextResponse.json(
          { ok: false, error: validation.error },
          { status: 400 }
        );
      }

      const orderPayload = validation.normalized!;
      const savedOrder = createFileOrder(orderPayload);
      
      console.log('Order created successfully in file system:', savedOrder.id);
      
      return NextResponse.json({
        ok: true,
        orderId: savedOrder.id,
        message: 'Pedido registrado exitosamente'
      });
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Error interno del servidor al procesar el pedido'
      },
      { status: 500 }
    );
  }
}