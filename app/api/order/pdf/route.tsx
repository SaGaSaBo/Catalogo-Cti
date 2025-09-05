// app/api/order/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createOrder } from '@/lib/supabase-orders';

// Forzar el runtime de Node.js y aumentar la duración máxima en Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Normaliza los items del carrito a un formato seguro para el PDF
function normalizeOrderItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items.flatMap(item => {
    // Caso 1: El item ya está aplanado (viene de CartModal)
    if (item.product && typeof item.size === 'string' && typeof item.quantity === 'number') {
      // Extraer solo los datos esenciales, sin imágenes ni datos pesados
      const product = item.product;
      return [{
        brand: product.brand || 'N/A',
        name: product.title || 'Sin Título',
        size: item.size || 'N/A',
        qty: item.quantity,
        unitPrice: Number(product.price) || 0,
        total: (Number(product.price) || 0) * item.quantity,
      }];
    }
    // Podríamos añadir más casos de normalización si otras partes de la app envían formatos diferentes
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
    const rawOrderData = await req.json();

    // Validar datos requeridos
    if (!rawOrderData.customer || !rawOrderData.items) {
      return NextResponse.json({ error: 'Datos de la orden incompletos' }, { status: 400 });
    }

    // Optimizar datos para reducir el payload
    const orderData = optimizeCartData(rawOrderData);
    const normalizedItems = normalizeOrderItems(orderData.items);
    const orderId = `ORD-${Date.now()}`;
    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.total, 0);

    try {
      // Guardar pedido en Supabase con datos optimizados
      const savedOrder = await createOrder(orderData);
      console.log('✅ Pedido guardado exitosamente:', savedOrder.order_number);
    } catch (dbError) {
      console.error('❌ Error saving order to database:', dbError);
      // No bloqueamos la generación del PDF si la BD falla.
    }

    // Crear el PDF con PDFKit
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Encabezado
    doc.fontSize(20).text('NOTA DE PEDIDO', { align: 'center' });
    doc.moveDown();
    
    // Información del pedido
    doc.fontSize(12);
    doc.text(`Número de Pedido: ${orderId}`);
    doc.text(`Cliente: ${orderData.customer.name}`);
    doc.text(`Email: ${orderData.customer.email}`);
    if (orderData.customer.phone) {
      doc.text(`Teléfono: ${orderData.customer.phone}`);
    }
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`);
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(10);
    let yPosition = doc.y;
    
    // Encabezados de la tabla
    doc.text('Marca', 50, yPosition);
    doc.text('Producto', 120, yPosition);
    doc.text('Talla', 250, yPosition);
    doc.text('Cant.', 300, yPosition);
    doc.text('Precio', 350, yPosition);
    doc.text('Total', 450, yPosition);
    
    // Línea separadora
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Productos
    normalizedItems.forEach((item, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.text(item.brand, 50, yPosition);
      doc.text(item.name, 120, yPosition, { width: 120 });
      doc.text(item.size, 250, yPosition);
      doc.text(item.qty.toString(), 300, yPosition);
      doc.text(`$${item.unitPrice.toLocaleString()}`, 350, yPosition);
      doc.text(`$${item.total.toLocaleString()}`, 450, yPosition);
      
      yPosition += 25;
    });

    // Total
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;
    
    doc.fontSize(14).text(`TOTAL: $${totalAmount.toLocaleString()}`, 400, yPosition);

    // Finalizar el PDF
    doc.end();

    // Esperar a que se complete la generación
    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    // Crear el stream de respuesta
    const pdfBuffer = Buffer.concat(chunks);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBuffer);
        controller.close();
      }
    });

    // Retornar el stream como respuesta
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeFileName = (orderData.customer.name || 'pedido').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    headers.set('Content-Disposition', `attachment; filename="pedido-${safeFileName}.pdf"`);

    return new NextResponse(stream, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return NextResponse.json({ error: 'Error interno al generar el PDF' }, { status: 500 });
  }
}