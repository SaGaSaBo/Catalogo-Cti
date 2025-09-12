// app/api/orders/[orderId]/pdf/route.tsx
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    throw new Error('Order not found');
  }
  
  return data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    console.log('📄 Generando PDF para pedido:', orderId);
    
    const order = await getOrder(orderId);
    const items = Array.isArray(order?.order_data?.items) ? order.order_data.items : [];

    console.log('📦 Items del pedido:', items.length);

    // Crear PDF con pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawRectangle({
      x: 0,
      y: height - 48,
      width,
      height: 48,
      color: rgb(0.231, 0.51, 0.965), // #3B82F6
    });
    page.drawText('ORDEN DE COMPRA', {
      x: 24,
      y: height - 34,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Datos del pedido
    let y = height - 80;
    const lineGap = 16;

    const drawText = (text: string, opts?: { bold?: boolean; size?: number }) => {
      const font = opts?.bold ? fontBold : fontReg;
      const size = opts?.size ?? 10;
      page.drawText(text, { x: 24, y, size, font, color: rgb(0, 0, 0) });
      y -= lineGap;
    };

    drawText('Información del Pedido', { bold: true, size: 12 });
    drawText(`Número: ${order.order_number}`);
    drawText(`Cliente: ${order.customer_name}`);
    drawText(`Email: ${order.customer_email}`);
    if (order.customer_phone) drawText(`Teléfono: ${order.customer_phone}`);
    drawText(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-UY')}`);

    y -= 8;

    // Tabla: headers
    const col = { prod: 24, brand: 220, size: 360, qty: 420, price: 470, total: 520 };
    const headerY = () => {
      page.drawRectangle({
        x: 24,
        y: y - 4,
        width: width - 48,
        height: 18,
        color: rgb(0.231, 0.51, 0.965),
      });
      page.drawText('Producto', { x: col.prod, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Marca',    { x: col.brand, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Talla',    { x: col.size, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Cant.',    { x: col.qty, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Precio',   { x: col.price, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Total',    { x: col.total, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      y -= 22;
    };

    const rowHeight = 22;
    const bottomMargin = 60;
    const nf = new Intl.NumberFormat('es-UY');

    const ensureSpace = () => {
      if (y < bottomMargin) {
        const p = pdfDoc.addPage();
        const size = p.getSize();
        y = size.height - 40;
        // redibujar header en nueva página
        p.drawRectangle({ x: 0, y: size.height - 48, width: size.width, height: 48, color: rgb(0.9, 0.9, 0.9) });
        p.drawText('ORDEN DE COMPRA (cont.)', { x: 24, y: size.height - 34, size: 14, font: fontBold });
        // reemplazar page actual y header
        (page as any) = p; // TS helper; en JS puro no hace falta
        headerY();
      }
    };

    // Header inicial
    headerY();

    for (let idx = 0; idx < items.length; idx++) {
      ensureSpace();

      const item = items[idx];
      const title = item.title || 'Sin título';
      const brand = item.brand || 'Sin marca';
      const sizeVal = item.size || 'N/A';
      const qty = item.quantity || 0;
      const price = item.price || 0;
      const totalLine = item.total || price * qty;
      const sku = item.sku || '';

      // Producto
      const productTitle = title.length > 30 ? title.slice(0, 27) + '…' : title;
      
      page.drawText(productTitle, {
        x: col.prod, y, size: 9, font: fontReg, color: rgb(0, 0, 0),
      });
      
      // SKU debajo del nombre (sutil)
      if (sku) {
        page.drawText(`SKU: ${sku}`, {
          x: col.prod, y: y - 10, size: 7, font: fontReg, color: rgb(0.4, 0.4, 0.4),
        });
      }
      
      page.drawText(brand.length > 18 ? brand.slice(0, 16) + '…' : brand, {
        x: col.brand, y, size: 9, font: fontReg,
      });
      page.drawText(String(sizeVal), { x: col.size, y, size: 9, font: fontReg });
      page.drawText(String(qty),     { x: col.qty, y, size: 9, font: fontReg });
      page.drawText(`$${nf.format(price)}`, { x: col.price, y, size: 9, font: fontReg });
      page.drawText(`$${nf.format(totalLine)}`, { x: col.total, y, size: 9, font: fontReg });

      y -= rowHeight;
    }

    y -= 10;
    page.drawText(`TOTAL: $${nf.format(order.total_amount)}`, { x: col.total - 40, y, size: 12, font: fontBold });

    // Footer
    page.drawText('Gracias por su compra', {
      x: 24, y: 24, size: 8, font: fontReg, color: rgb(0.4, 0.45, 0.5),
    });

    const bytes = await pdfDoc.save();

    console.log('✅ PDF generado exitosamente para pedido:', order.order_number);

    // streaming simple (un chunk es suficiente)
    const stream = new ReadableStream<Uint8Array>({
      start(c) { c.enqueue(bytes); c.close(); },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${order.order_number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}