// app/api/order/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import OrderNote, { OrderNoteProps } from '@/app/pdf/OrderNote';
import { createOrder } from '@/lib/supabase-orders';

// Forzar el runtime de Node.js y aumentar la duración máxima en Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Normaliza los items del carrito a un formato plano y seguro para el PDF
function normalizeOrderItems(items: any[]): OrderNoteProps['items'] {
  if (!Array.isArray(items)) return [];

  return items.flatMap(item => {
    // Caso 1: El item ya está aplanado (viene de CartModal)
    if (item.product && typeof item.size === 'string' && typeof item.quantity === 'number') {
      return [{
        sku: item.product.sku || 'N/A',
        name: `${item.product.brand || ''} - ${item.product.title || 'Sin Título'}`,
        qty: item.quantity,
        unitPrice: item.product.price || 0,
      }];
    }
    // Podríamos añadir más casos de normalización si otras partes de la app envían formatos diferentes
    console.warn('Item con formato no reconocido:', item);
    return [];
  });
}

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();

    // Validar datos requeridos
    if (!orderData.customer || !orderData.items) {
      return NextResponse.json({ error: 'Datos de la orden incompletos' }, { status: 400 });
    }

    const normalizedItems = normalizeOrderItems(orderData.items);

    const pdfProps: OrderNoteProps = {
      orderId: `ORD-${Date.now()}`,
      customerName: orderData.customer.name,
      customerEmail: orderData.customer.email,
      items: normalizedItems,
      currency: 'CLP', // Asumiendo CLP, podría venir del payload
      createdAt: new Date().toISOString(),
    };

    try {
      // Guardar pedido en Supabase (opcional, pero recomendado)
      const savedOrder = await createOrder(orderData);
      console.log('✅ Pedido guardado exitosamente:', savedOrder.order_number);
    } catch (dbError) {
      console.error('❌ Error saving order to database:', dbError);
      // No bloqueamos la generación del PDF si la BD falla.
    }

    // Generar el stream del PDF
    const stream = await renderToStream(<OrderNote {...pdfProps} />);

    // Retornar el stream como respuesta
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeFileName = (orderData.customer.name || 'pedido').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    headers.set('Content-Disposition', `attachment; filename="pedido-${safeFileName}.pdf"`);

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return NextResponse.json({ error: 'Error interno al generar el PDF' }, { status: 500 });
  }
}