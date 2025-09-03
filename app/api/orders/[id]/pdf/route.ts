import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/supabase-orders';
import { createPDF } from '@/lib/pdf-generator';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrder(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Si el PDF está almacenado, devolverlo
    if (order.pdf_data) {
      return new NextResponse(order.pdf_data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pedido-${order.order_number}.pdf"`,
        },
      });
    }

    // Si no hay PDF almacenado, generar uno nuevo
    const pdfBuffer = await createPDF(order.order_data);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
