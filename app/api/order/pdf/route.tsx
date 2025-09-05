// app/api/order/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createOrder } from '@/lib/supabase-orders';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Forzar el runtime de Node.js y aumentar la duración máxima en Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cargar fuentes TTF para evitar problemas con archivos .afm en Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.join(__dirname, '_fonts');

const interRegular = readFileSync(path.join(fontsDir, 'Inter-Regular.ttf'));
const interBold = readFileSync(path.join(fontsDir, 'Inter-Bold.ttf'));

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
      items: rawOrderData.i.map((item: any) => ({
        product: {
          id: item.p.i,
          sku: item.p.s,
          title: item.p.t,
          brand: item.p.b,
          price: item.p.pr
        },
        size: item.sz,
        quantity: item.q
      })),
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

    // Crear el PDF con PDFKit (streaming para evitar memory issues)
    console.log('📄 Creando PDF con PDFKit...');
    
    const formatPrice = (value: number) => {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    };

    const total = normalizedItems.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);

    // Crear stream con PDFKit
    const doc = new PDFDocument({ size: 'A4', margin: 24 });
    
    // Registrar fuentes TTF para evitar problemas con archivos .afm
    doc.registerFont('UI-Regular', interRegular);
    doc.registerFont('UI-Bold', interBold);
    
    // Streaming response para evitar acumular todo en memoria
    const stream = new ReadableStream({
      start(controller) {
        doc.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        doc.on('end', () => {
          controller.close();
        });
        
        doc.on('error', (err) => {
          console.error('❌ Error en PDFKit:', err);
          controller.error(err);
        });

        // ==== Encabezado de la orden ====
        doc.rect(0, 0, doc.page.width, 40).fill('#3B82F6');
        doc.fill('#FFFFFF').font('UI-Bold').fontSize(18).text('NOTA DE PEDIDO', 24, 14);

        // Información del cliente
        doc.fill('#000').fontSize(11).font('UI-Bold').text('Información del Cliente', 24, 60);
        doc.font('UI-Regular').fontSize(10);
        doc.text(`Pedido: ${orderId}`, 24, 78);
        doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 24, 92);
        doc.text(`Cliente: ${rawOrderData.c.n}`, 24, 106);
        if (rawOrderData.c.e) doc.text(`Email: ${rawOrderData.c.e}`, 24, 120);
        if (rawOrderData.c.p) doc.text(`Teléfono: ${rawOrderData.c.p}`, 24, 134);
        
        doc.moveTo(24, 150).lineTo(doc.page.width - 24, 150).strokeColor('#E5E7EB').stroke();

        // ==== Tabla ====
        let y = 165;
        const col = { sku: 24, name: 120, qty: 400, price: 450 };

        // Función para dibujar header de tabla (reutilizable para paginación)
        const drawTableHeader = () => {
          doc.rect(24, y - 12, doc.page.width - 48, 18).fill('#3B82F6');
          doc.fill('#fff').font('UI-Bold').fontSize(9);
          doc.text('SKU', col.sku, y - 10);
          doc.text('Producto', col.name, y - 10);
          doc.text('Cant.', col.qty, y - 10);
          doc.text('Total', col.price, y - 10);
          y += 14;
        };

        // Dibujar header inicial
        drawTableHeader();

        // Filas de productos (sin logs en el loop para evitar IO extra)
        console.log('📊 Procesando', normalizedItems.length, 'items...');
        doc.fill('#000').font('UI-Regular').fontSize(9);
        normalizedItems.forEach((it, idx) => {
          // Verificar si necesitamos nueva página
          if (y + 20 > doc.page.height - 50) {
            doc.addPage();
            y = 50;
            // Reimprimir header en nueva página
            drawTableHeader();
          }

          // Fila alternada
          if (idx % 2 === 0) {
            doc.save().rect(24, y - 2, doc.page.width - 48, 18).fill('#F3F4F6').restore();
          }

          // Asegurar que todos los valores sean strings válidos
          const sku = String(it.sku || 'N/A');
          const name = String(it.name || 'Sin nombre');
          const qty = String(it.qty || 0);
          const price = formatPrice(it.unitPrice * it.qty);

          doc.text(sku, col.sku, y);
          doc.text(name, col.name, y);
          doc.text(qty, col.qty, y);
          doc.text(price, col.price, y);
          y += 18;
        });
        console.log('✅ Items procesados');

        // Total
        y += 20;
        doc.font('UI-Bold').fontSize(12);
        doc.text(`TOTAL: ${formatPrice(total)}`, col.price - 50, y);

        // Footer
        doc.font('UI-Regular').fontSize(8).fill('#6B7280');
        doc.text('Gracias por su compra', 0, doc.page.height - 40, { align: 'center' });

        doc.end();
      }
    });

    // Headers correctos para descarga
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Cache-Control', 'no-store');
    const safeFileName = (rawOrderData.c.n || 'pedido').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    headers.set('Content-Disposition', `attachment; filename="pedido-${safeFileName}.pdf"`);

    console.log('✅ PDF creado exitosamente con PDFKit (streaming + TTF fonts)');
    return new Response(stream, { status: 200, headers });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Error interno al generar el PDF',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}