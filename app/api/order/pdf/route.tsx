// app/api/order/pdf/route.tsx
import PDFDocument from 'pdfkit';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  // 🔍 Verificación temporal de AFM en runtime (opcional)
  try {
    const { existsSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const helv = fileURLToPath(new URL('./data/Helvetica.afm', import.meta.url));
    console.log('[AFM]', helv, 'exists?', existsSync(helv));
  } catch (e) {
    console.log('[AFM] error checking:', e);
  }

  const doc = new PDFDocument({ size: 'A4', margin: 24 });

  doc.rect(0, 0, doc.page.width, 40).fill('#3B82F6');
  doc.fill('#fff').font('Helvetica-Bold').fontSize(18).text('ORDEN DE COMPRA', 24, 14);
  doc.fill('#000').font('Helvetica').fontSize(10).text('Contenido…', 24, 80);

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      doc.on('data', (b: Buffer) => c.enqueue(new Uint8Array(b)));
      doc.on('end', () => c.close());
      doc.on('error', (e) => c.error(e));
      doc.end();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="pedido.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}