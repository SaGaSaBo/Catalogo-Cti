// app/api/order/pdf/route.tsx
import type { NextRequest } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';

// Tipos para el payload
interface OrderItem {
  sku: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

interface OrderPayload {
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  currency: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('[PDF] Iniciando generación de PDF con pdf-lib...');
    
    const payload: OrderPayload = await req.json();
    console.log('[PDF] Payload recibido:', { 
      orderId: payload.orderId, 
      itemCount: payload.items?.length,
      customer: payload.customer?.name 
    });

    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    console.log('[PDF] Documento PDF creado exitosamente');

    // Agregar una página
    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const { width, height } = page.getSize();
    
    // Cargar fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    console.log('[PDF] Fuentes cargadas exitosamente');

    // Configuración de colores
    const primaryColor = rgb(0.12, 0.25, 0.69); // Azul
    const textColor = rgb(0.2, 0.2, 0.2); // Gris oscuro
    const lightGray = rgb(0.95, 0.95, 0.95);

    let yPosition = height - 50;

    // Título principal
    page.drawText('NOTA DE PEDIDO', {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: primaryColor,
    });

    yPosition -= 40;

    // Información del pedido
    page.drawText(`Pedido: ${payload.orderId}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: textColor,
    });

    page.drawText(`Fecha: ${new Date(payload.createdAt).toLocaleDateString('es-CL')}`, {
      x: 350,
      y: yPosition,
      size: 12,
      font: font,
      color: textColor,
    });

    yPosition -= 30;

    // Información del cliente
    page.drawText('INFORMACIÓN DEL CLIENTE', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: primaryColor,
    });

    yPosition -= 20;

    // Rectángulo de fondo para info del cliente
    page.drawRectangle({
      x: 45,
      y: yPosition - 45,
      width: width - 90,
      height: 50,
      color: lightGray,
    });

    page.drawText(`Nombre: ${payload.customer.name}`, {
      x: 55,
      y: yPosition - 15,
      size: 11,
      font: font,
      color: textColor,
    });

    page.drawText(`Email: ${payload.customer.email}`, {
      x: 55,
      y: yPosition - 30,
      size: 11,
      font: font,
      color: textColor,
    });

    if (payload.customer.phone) {
      page.drawText(`Teléfono: ${payload.customer.phone}`, {
        x: 55,
        y: yPosition - 45,
        size: 11,
        font: font,
        color: textColor,
      });
    }

    yPosition -= 80;

    // Título de productos
    page.drawText('DETALLE DEL PEDIDO', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: primaryColor,
    });

    yPosition -= 25;

    // Encabezados de tabla
    const tableHeaders = ['Producto', 'Talle', 'Cant.', 'Precio Unit.', 'Total'];
    const columnWidths = [200, 50, 40, 80, 80];
    let xPosition = 50;

    // Fondo del encabezado
    page.drawRectangle({
      x: 45,
      y: yPosition - 20,
      width: width - 90,
      height: 30,
      color: primaryColor,
    });

    // Texto del encabezado
    tableHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition + 5,
        y: yPosition - 12,
        size: 10,
        font: boldFont,
        color: rgb(1, 1, 1), // Blanco
      });
      xPosition += columnWidths[index];
    });

    yPosition -= 35;

    // Datos de productos
    let totalGeneral = 0;
    let totalUnidades = 0;

    payload.items.forEach((item, index) => {
      const subtotal = item.qty * item.price;
      totalGeneral += subtotal;
      totalUnidades += item.qty;

      // Alternar color de fondo para las filas
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 45,
          y: yPosition - 35,
          width: width - 90,
          height: 40,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      xPosition = 50;
      
      // Dibujar nombre del producto (primera línea)
      const productName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name;
      page.drawText(productName, {
        x: xPosition + 5,
        y: yPosition - 12,
        size: 9,
        font: boldFont,
        color: textColor,
      });
      
      // Dibujar SKU debajo del nombre (segunda línea)
      page.drawText(`SKU: ${item.sku}`, {
        x: xPosition + 5,
        y: yPosition - 25,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5), // Color gris más claro
      });
      
      // Avanzar a la siguiente columna (Talle)
      xPosition += columnWidths[0];
      
      // Dibujar resto de datos
      const remainingData = [
        item.size,
        item.qty.toString(),
        `${payload.currency} ${item.price.toLocaleString('es-CL')}`,
        `${payload.currency} ${subtotal.toLocaleString('es-CL')}`
      ];
      
      remainingData.forEach((data, colIndex) => {
        page.drawText(data, {
          x: xPosition + 5,
          y: yPosition - 18, // Centrado verticalmente en la fila más alta
          size: 9,
          font: font,
          color: textColor,
        });
        xPosition += columnWidths[colIndex + 1]; // +1 porque ya avanzamos la primera columna
      });

      yPosition -= 40; // Más espacio para las dos líneas
    });

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: primaryColor,
    });

    yPosition -= 20;

    // Totales
    page.drawText(`Total de Unidades: ${totalUnidades}`, {
      x: 350,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: textColor,
    });

    yPosition -= 20;

    page.drawText(`TOTAL: ${payload.currency} ${totalGeneral.toLocaleString('es-CL')}`, {
      x: 350,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: primaryColor,
    });

    yPosition -= 40;

    // Nota al pie
    page.drawText('Puede descargar y enviar esta nota a su vendedor de', {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });

    yPosition -= 15;

    page.drawText('Consorcio Textil Internacional SpA.', {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: primaryColor,
    });

    console.log('[PDF] Contenido agregado exitosamente');

    // Generar el PDF
    const pdfBytes = await pdfDoc.save();
    console.log('[PDF] PDF generado exitosamente, tamaño:', pdfBytes.length);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nota-pedido-${payload.orderId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[PDF] Error generating PDF:', error);
    console.error('[PDF] Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return new Response(
      JSON.stringify({ 
        error: 'Error al generar el PDF',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}