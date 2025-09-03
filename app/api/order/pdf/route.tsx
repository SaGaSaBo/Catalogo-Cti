import { NextRequest, NextResponse } from 'next/server';
import { createPDF } from '@/lib/pdf-generator';
import { createOrder } from '@/lib/supabase-orders';

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    
    // Validar datos requeridos
    if (!orderData.customer || !orderData.items || !orderData.total) {
      return NextResponse.json(
        { error: 'Datos de la orden incompletos' },
        { status: 400 }
      );
    }

    console.log('🛒 Procesando pedido para:', orderData.customer.name);
    console.log('📦 Items:', orderData.items.length);
    console.log('💰 Total:', orderData.total);

    // Generar PDF
    const pdfBuffer = await createPDF(orderData);
    console.log('📄 PDF generado exitosamente, tamaño:', pdfBuffer.length, 'bytes');
    
    try {
      // Guardar pedido en la base de datos (sin PDF para evitar timeout)
      console.log('💾 Guardando pedido en la base de datos...');
      const savedOrder = await createOrder(orderData);
      console.log('✅ Pedido guardado exitosamente:', savedOrder.order_number);
    } catch (dbError) {
      console.error('❌ Error saving order to database:', dbError);
      // Continuar con la generación del PDF aunque falle el guardado en BD
    }
    
    // Retornar PDF como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orden-${orderData.customer.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Error interno al generar el PDF' },
      { status: 500 }
    );
  }
}