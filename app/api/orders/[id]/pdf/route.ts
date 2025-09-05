import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/supabase-orders';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { formatCurrency } from '@/lib/currency';

// Force Node.js runtime on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Item Normalization ---
// This is the core logic to handle complex item structures.
function normalizeOrderItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];

  const flattenedItems: any[] = [];

  items.forEach(item => {
    const baseProduct = item.product || item; // Handle both nested and flat structures

    // Case 1: `sizes` is an array of objects like [{ size: 'S', quantity: 2, price: 100 }]
    if (Array.isArray(item.sizes) && typeof item.sizes[0] === 'object' && item.sizes[0] !== null) {
      item.sizes.forEach((sizeInfo: any) => {
        flattenedItems.push({
          name: `${baseProduct.brand || ''} ${baseProduct.title || 'N/A'}`,
          sku: baseProduct.sku || 'N/A',
          size: sizeInfo.size || 'Único',
          quantity: Number(sizeInfo.quantity) || 0,
          price: Number(sizeInfo.price) || Number(baseProduct.price) || 0,
        });
      });
    }
    // Case 2: `sizes` is an object map like { "S": 2, "M": 1 }
    else if (typeof item.sizes === 'object' && item.sizes !== null && !Array.isArray(item.sizes)) {
      for (const [size, quantity] of Object.entries(item.sizes)) {
        flattenedItems.push({
          name: `${baseProduct.brand || ''} ${baseProduct.title || 'N/A'}`,
          sku: baseProduct.sku || 'N/A',
          size: size,
          quantity: Number(quantity) || 0,
          price: Number(baseProduct.price) || 0,
        });
      }
    }
    // Case 3: `size` is a simple string
    else if (typeof item.size === 'string') {
      flattenedItems.push({
        name: `${baseProduct.brand || ''} ${baseProduct.title || 'N/A'}`,
        sku: baseProduct.sku || 'N/A',
        size: item.size,
        quantity: Number(item.quantity) || 0,
        price: Number(baseProduct.price) || 0,
      });
    }
    // Case 4: `sizes` is an array of strings
    else if (Array.isArray(item.sizes) && typeof item.sizes[0] === 'string') {
        item.sizes.forEach((size: string) => {
            flattenedItems.push({
                name: `${baseProduct.brand || ''} ${baseProduct.title || 'N/A'}`,
                sku: baseProduct.sku || 'N/A',
                size: size,
                quantity: 1, // Default to 1 if not specified per size
                price: Number(baseProduct.price) || 0,
            });
        });
    }
    // Fallback for items without specific size info
    else {
      flattenedItems.push({
        name: `${baseProduct.brand || ''} ${baseProduct.title || 'N/A'}`,
        sku: baseProduct.sku || 'N/A',
        size: 'Único',
        quantity: Number(item.quantity) || 1,
        price: Number(baseProduct.price) || 0,
      });
    }
  });

  return flattenedItems.filter(item => item.quantity > 0);
}


// --- PDF Generation ---
async function generateOrderPdf(order: any): Promise<Readable> {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });

  const stream = new Readable({
    read() {
      // This space is intentionally left blank.
    },
  });

  doc.on('data', (chunk) => stream.push(chunk));
  doc.on('end', () => stream.push(null));

  const customer = order.order_data?.customer || {};
  const items = normalizeOrderItems(order.order_data?.items || []);
  const orderDate = new Date(order.created_at).toLocaleDateString('es-CL');

  // --- Helper for Pagination ---
  const printHeader = () => {
    doc.fontSize(20).font('Helvetica-Bold').text('Nota de Pedido', { align: 'center' });
    doc.moveDown();
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Pedido: #${order.order_number}`, { continued: true })
      .text(`Fecha: ${orderDate}`, { align: 'right' });
    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('SKU', 50, tableTop);
    doc.text('Producto', 120, tableTop);
    doc.text('Talle', 300, tableTop);
    doc.text('Cant.', 380, tableTop, { width: 40, align: 'right' });
    doc.text('P. Unitario', 420, tableTop, { width: 70, align: 'right' });
    doc.text('Total', 490, tableTop, { width: 70, align: 'right' });
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();
  };

  // --- Document Body ---
  printHeader();
  let y = doc.y;
  let totalOrderAmount = 0;

  for (const item of items) {
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    totalOrderAmount += itemTotal;
    const rowHeight = Math.max(20, doc.heightOfString(item.name, { width: 180 }) + 5);

    // Check for page break BEFORE drawing content
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      printHeader();
      y = doc.y;
    }

    doc.fontSize(9).font('Helvetica');
    doc.text(String(item.sku), 120, y, { width: 180 });
    doc.text(String(item.name), 120, y, { width: 180 });
    doc.text(String(item.size), 300, y, { width: 80 });
    doc.text(String(item.quantity), 380, y, { width: 40, align: 'right' });
    doc.text(formatCurrency(item.price), 420, y, { width: 70, align: 'right' });
    doc.text(formatCurrency(itemTotal), 490, y, { width: 70, align: 'right' });
    y += rowHeight;
    doc.y = y; // Sync document's y with our tracker
    doc.moveDown(0.5);
  }

  // --- Footer ---
  doc.moveTo(50, y).lineTo(560, y).stroke();
  doc.moveDown();
  doc.fontSize(12).font('Helvetica-Bold').text(`Total Pedido: ${formatCurrency(totalOrderAmount)}`, { align: 'right' });

  doc.end();
  return stream;
}

// --- API Route Handler ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'ID de pedido no proporcionado' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const pdfStream = await generateOrderPdf(order);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="pedido-${order.order_number}.pdf"`);

    return new NextResponse(pdfStream as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Error interno al generar el PDF', details: error.message },
      { status: 500 }
    );
  }
}