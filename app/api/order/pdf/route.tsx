// app/api/order/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import OrderNote, { OrderNoteProps } from '@/app/pdf/OrderNote';
import { createOrder } from '@/lib/supabase-orders';

// Forzar el runtime de Node.js y aumentar la duración máxima en Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Normaliza los items del carrito a un formato seguro para el PDF
function normalizeOrderItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items.flatMap(item => {
    // Caso 1: Datos optimizados (formato ultra-compacto)
    if (item.p && typeof item.sz === 'string' && typeof item.q === 'number') {
      const product = item.p;
      return [{
        brand: product.b || 'N/A',
        name: product.t || 'Sin Título',
        sku: product.s || 'N/A',
        size: item.sz || 'N/A',
        qty: item.q,
        unitPrice: Number(product.pr) || 0,
        total: (Number(product.pr) || 0) * item.q,
      }];
    }
    // Caso 2: Formato original (fallback)
    if (item.product && typeof item.size === 'string' && typeof item.quantity === 'number') {
      const product = item.product;
      return [{
        brand: product.brand || 'N/A',
        name: product.title || 'Sin Título',
        sku: product.sku || 'N/A',
        size: item.size || 'N/A',
        qty: item.quantity,
        unitPrice: Number(product.price) || 0,
        total: (Number(product.price) || 0) * item.quantity,
      }];
    }
    console.warn('Item con formato no reconocido:', item);
    return [];
  });
}

// Función para limpiar y optimizar los datos del carrito antes de enviarlos
function optimizeCartData(cartData: any) {
  if (!cartData || !cartData.items) return cartData;

  // Crear una copia optimizada sin datos pesados
  const optimizedItems = cartData.items.map((item: any) => {
    if (item.product) {
      // Extraer solo los campos esenciales del producto
      const { id, sku, title, brand, price } = item.product;
      return {
        product: { id, sku, title, brand, price },
        size: item.size,
        quantity: item.quantity
      };
    }
    return item;
  });

  return {
    ...cartData,
    items: optimizedItems
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Iniciando generación de PDF...');
    const rawOrderData = await req.json();
    console.log('📦 Datos recibidos:', JSON.stringify(rawOrderData, null, 2));

    // Validar datos requeridos (formato optimizado)
    if (!rawOrderData.c || !rawOrderData.i) {
      console.error('❌ Datos incompletos:', { c: rawOrderData.c, i: rawOrderData.i });
      return NextResponse.json({ error: 'Datos de la orden incompletos' }, { status: 400 });
    }

    // Los datos ya vienen optimizados, procesar directamente
    console.log('🔄 Normalizando items...');
    const normalizedItems = normalizeOrderItems(rawOrderData.i);
    console.log('✅ Items normalizados:', normalizedItems.length);
    
    const orderId = `ORD-${Date.now()}`;
    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    console.log('💰 Total calculado:', totalAmount);

    // Reconstruir datos para Supabase (formato completo)
    const orderDataForDB = {
      customer: {
        name: rawOrderData.c.n,
        email: rawOrderData.c.e,
        phone: rawOrderData.c.p
      },
      items: rawOrderData.i,
      total: rawOrderData.t
    };

    try {
      // Guardar pedido en Supabase
      const savedOrder = await createOrder(orderDataForDB);
      console.log('✅ Pedido guardado exitosamente:', savedOrder.order_number);
    } catch (dbError) {
      console.error('❌ Error saving order to database:', dbError);
      // No bloqueamos la generación del PDF si la BD falla.
    }

    // Crear el PDF con @react-pdf/renderer
    console.log('📄 Creando PDF con @react-pdf/renderer...');
    
    const pdfProps: OrderNoteProps = {
      orderId: orderId,
      customerName: rawOrderData.c.n,
      customerEmail: rawOrderData.c.e,
      customerPhone: rawOrderData.c.p || '',
      items: normalizedItems.map(item => ({
        sku: item.sku,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      currency: 'CLP',
      createdAt: new Date().toISOString(),
    };

    console.log('📊 Generando stream del PDF...');
    const stream = await renderToStream(<OrderNote {...pdfProps} />);
    console.log('✅ Stream del PDF creado');

    // Retornar el stream como respuesta
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeFileName = (rawOrderData.c.n || 'pedido').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    headers.set('Content-Disposition', `attachment; filename="pedido-${safeFileName}.pdf"`);

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Error interno al generar el PDF',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}