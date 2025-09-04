import jsPDF from 'jspdf';

interface OrderItem {
  id?: string;
  title?: string;
  brand?: string;
  price?: number;
  sku?: string;
  size?: string;
  quantity?: number;
  total?: number;
  product?: {
    id?: string;
    title?: string;
    brand?: string;
    price?: number;
    sku?: string;
  };
}

interface OrderData {
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  total: number;
  date?: string;
}

export async function createPDF(orderData: OrderData): Promise<Uint8Array> {
  const doc = new jsPDF();
  
  // Configuración de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores
  const primaryColor = [59, 130, 246]; // Blue-500
  const grayColor = [107, 114, 128]; // Gray-500
  const lightGrayColor = [243, 244, 246]; // Gray-100
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ORDEN DE COMPRA', 20, 20);
  
  // Información del cliente
  doc.setFillColor(...lightGrayColor);
  doc.rect(20, 40, pageWidth - 40, 35, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Información del Cliente', 25, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${orderData.customer.name}`, 25, 60);
  doc.text(`Email: ${orderData.customer.email}`, 25, 68);
  
  if (orderData.customer.phone) {
    doc.text(`Teléfono: ${orderData.customer.phone}`, 25, 76);
  }
  
  // Fecha
  const currentDate = orderData.date || new Date().toLocaleDateString('es-CL');
  doc.text(`Fecha: ${currentDate}`, pageWidth - 60, 60);
  
  // Tabla de productos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Productos', 20, 90);
  
  // Headers de la tabla
  doc.setFillColor(...primaryColor);
  doc.rect(20, 95, pageWidth - 40, 12, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Producto', 22, 103);
  doc.text('Marca', 60, 103);
  doc.text('Talla', 90, 103);
  doc.text('Cant.', 110, 103);
  doc.text('Precio', 130, 103);
  doc.text('Total', 160, 103);
  
  // Productos
  let yPosition = 115;
  
  orderData.items.forEach((item, index) => {
    // Alternar colores de fondo
    if (index % 2 === 0) {
      doc.setFillColor(...lightGrayColor);
      doc.rect(20, yPosition - 5, 170, 15, 'F');
    }
    
    // Primera línea: Título del producto y marca
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Manejar diferentes estructuras de datos de forma segura - Vercel fix
    const productTitle = item.product?.title || item.title || 'Sin título';
    const productBrand = item.product?.brand || item.brand || 'Sin marca';
    const productSku = item.product?.sku || item.sku || 'Sin SKU';
    const productPrice = item.product?.price || item.price || 0;
    const itemSize = item.size || 'N/A';
    const itemQuantity = item.quantity || 0;
    const itemTotal = item.total || 0;
    
    // Truncar texto si es muy largo
    const truncatedTitle = productTitle.length > 25 
      ? productTitle.substring(0, 22) + '...' 
      : productTitle;
    
    doc.text(truncatedTitle, 22, yPosition);
    doc.text(productBrand, 60, yPosition);
    
    // Segunda línea: SKU (fuente más pequeña)
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(`SKU: ${productSku}`, 22, yPosition + 4);
    
    // Resto de la información
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(itemSize, 90, yPosition);
    doc.text(itemQuantity.toString(), 110, yPosition);
    doc.text(`$${productPrice.toLocaleString()}`, 130, yPosition);
    doc.text(`$${itemTotal.toLocaleString()}`, 160, yPosition);
    
    yPosition += 20;
    
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Total: $${orderData.total.toLocaleString()}`, pageWidth - 60, yPosition + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Gracias por su compra', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  return doc.output('arraybuffer') as Uint8Array;
}
