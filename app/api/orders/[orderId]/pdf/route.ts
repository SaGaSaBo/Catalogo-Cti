// app/api/orders/[orderId]/pdf/route.ts
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}

function toWebStream(draw: (doc: PDFDocument) => void): ReadableStream<Uint8Array> {
  const doc = new PDFDocument({ size: 'A4', margin: 24 });
  return new ReadableStream<Uint8Array>({
    start(controller) {
      doc.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      doc.on('end', () => controller.close());
      doc.on('error', (err) => controller.error(err));
      draw(doc);
      doc.end();
    },
  });
}

export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  try {
    const order = await getOrder(params.orderId);
    const items = Array.isArray(order?.order_data?.items) ? order.order_data.items : [];

    // Sanear por si arrastran campos pesados
    for (const it of items) {
      delete (it as any).image;
      delete (it as any).thumbnail;
      delete (it as any).images;
      if (Array.isArray((it as any).imageUrls)) {
        (it as any).imageUrls = (it as any).imageUrls.filter((u: string) => /^https?:\/\//i.test(u));
      }
    }

    const stream = toWebStream((doc) => {
      // Header
      doc.rect(0, 0, doc.page.width, 40).fill('#3B82F6');
      doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('ORDEN DE COMPRA', 24, 14);

      // Cliente
      doc.fill('#000').fontSize(11).font('Helvetica-Bold').text('Información del Cliente', 24, 60);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nombre: ${order.customer_name ?? '-'}`, 24, 78);
      doc.text(`Email: ${order.customer_email ?? '-'}`, 24, 92);
      if (order.customer_phone) doc.text(`Teléfono: ${order.customer_phone}`, 24, 106);
      doc.text(`Fecha: ${String(order.created_at).slice(0, 19).replace('T', ' ')}`, 24, 120);
      doc.moveTo(24, 130).lineTo(doc.page.width - 24, 130).strokeColor('#E5E7EB').stroke();

      // Tabla
      let y = 145;
      const col = { prod: 24, brand: 220, size: 350, qty: 400, price: 450, total: 520 };

      const drawHeader = () => {
        doc.rect(24, y - 12, doc.page.width - 48, 18).fill('#3B82F6');
        doc.fill('#fff').font('Helvetica-Bold').fontSize(9);
        doc.text('Producto', col.prod, y - 10);
        doc.text('Marca', col.brand, y - 10);
        doc.text('Talla', col.size, y - 10);
        doc.text('Cant.', col.qty, y - 10);
        doc.text('Precio', col.price, y - 10);
        doc.text('Total', col.total, y - 10);
        y += 14;
        doc.fill('#000').font('Helvetica').fontSize(9);
      };

      const newPage = () => {
        doc.addPage();
        y = 20;
        drawHeader();
      };

      drawHeader();

      const rowHeight = 20;
      const bottomMargin = 50;

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        if (y + rowHeight > doc.page.height - bottomMargin) {
          newPage();
        }

        // Datos seguros
        const rawTitle = item.product?.title || item.title || 'Sin título';
        const rawBrand = item.product?.brand || item.brand || 'Sin marca';
        const rawSku = item.product?.sku || item.sku || 'Sin SKU';
        const rawPrice = item.product?.price || item.price || 0;

        const productTitle = typeof rawTitle === 'string' ? rawTitle : String(rawTitle || 'Sin título');
        const productBrand = typeof rawBrand === 'string' ? rawBrand : String(rawBrand || 'Sin marca');
        const productSku = typeof rawSku === 'string' ? rawSku : String(rawSku || 'Sin SKU');
        const productPrice = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice || 0);

        const itemSize = item.size || 'N/A';
        const itemQuantity = item.quantity || 0;
        const itemTotal = item.total || 0;

        // Truncar texto si es muy largo
        const truncatedTitle = productTitle.length > 25
          ? productTitle.substring(0, 22) + '...'
          : productTitle;

        doc.text(truncatedTitle, col.prod, y);
        doc.text(productBrand, col.brand, y);
        doc.text(itemSize, col.size, y);
        doc.text(itemQuantity.toString(), col.qty, y);
        doc.text(`$${productPrice.toLocaleString()}`, col.price, y);
        doc.text(`$${itemTotal.toLocaleString()}`, col.total, y);

        // SKU en línea separada (fuente más pequeña)
        doc.fontSize(7);
        doc.fill('#6B7280');
        doc.text(`SKU: ${productSku}`, col.prod, y + 8);
        
        // Restaurar fuente
        doc.fontSize(9);
        doc.fill('#000');

        y += rowHeight;
      }

      // Total
      y += 20;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`TOTAL: $${order.total_amount?.toLocaleString() || '0'}`, col.total - 50, y);
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${order.order_number ?? params.orderId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('PDF error', e);
    return NextResponse.json({ error: 'No se pudo generar el PDF' }, { status: 500 });
  }
}
