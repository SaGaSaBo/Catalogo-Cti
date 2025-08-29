import { OrderPayload } from './types';

export function generateOrderEmailHTML(order: OrderPayload, catalogName: string = 'Catálogo Mayorista'): string {
  const date = new Date().toLocaleString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const currency = process.env.CURRENCY || '$';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nuevo Pedido - ${catalogName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .customer-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #e2e8f0; padding: 12px; border: 1px solid #cbd5e1; text-align: left; }
        .order-table td { padding: 12px; border: 1px solid #cbd5e1; }
        .order-table img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
        .totals { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .brand-chip { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Nuevo Pedido Recibido</h1>
        <p>${catalogName} - ${date}</p>
    </div>
    
    <div class="content">
        <div class="customer-info">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.buyer.name}</p>
            <p><strong>Email:</strong> ${order.buyer.email}</p>
            ${order.buyer.phone ? `<p><strong>Teléfono:</strong> ${order.buyer.phone}</p>` : ''}
        </div>

        <h3>Detalle del Pedido</h3>
        <table class="order-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Talle</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => {
                  return Object.entries(item.quantities)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([size, quantity]) => `
                      <tr>
                          <td>${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}">` : '-'}</td>
                          <td>
                              <span class="brand-chip">${item.brand}</span><br>
                              <strong>${item.title}</strong>
                          </td>
                          <td>${item.sku}</td>
                          <td>${size}</td>
                          <td>${quantity}</td>
                          <td>${currency} ${item.price}</td>
                          <td>${currency} ${(item.price * quantity).toFixed(2)}</td>
                      </tr>
                    `).join('');
                }).join('')}
            </tbody>
        </table>

        <div class="totals">
            <h3>Resumen del Pedido</h3>
            <p><strong>Total de Unidades:</strong> ${order.totalUnits}</p>
            <p><strong>Monto Total:</strong> ${currency} ${order.totalAmount.toFixed(2)}</p>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateOrderEmailText(order: OrderPayload, catalogName: string = 'Catálogo Mayorista'): string {
  const date = new Date().toLocaleString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires' 
  });
  
  const currency = process.env.CURRENCY || '$';
  
  let text = `NUEVO PEDIDO - ${catalogName}\n`;
  text += `Fecha: ${date}\n\n`;
  
  text += `INFORMACIÓN DEL CLIENTE:\n`;
  text += `Nombre: ${order.buyer.name}\n`;
  text += `Email: ${order.buyer.email}\n`;
  if (order.buyer.phone) {
    text += `Teléfono: ${order.buyer.phone}\n`;
  }
  text += `\n`;
  
  text += `DETALLE DEL PEDIDO:\n`;
  text += `${'='.repeat(80)}\n`;
  
  order.items.forEach(item => {
    Object.entries(item.quantities).forEach(([size, quantity]) => {
      if (quantity > 0) {
        text += `${item.brand} - ${item.title} (${item.sku})\n`;
        text += `Talle: ${size} | Cantidad: ${quantity} | Precio: ${currency} ${item.price} | Subtotal: ${currency} ${(item.price * quantity).toFixed(2)}\n\n`;
      }
    });
  });
  
  text += `${'='.repeat(80)}\n`;
  text += `TOTALES:\n`;
  text += `Total de Unidades: ${order.totalUnits}\n`;
  text += `Monto Total: ${currency} ${order.totalAmount.toFixed(2)}\n`;
  
  return text;
}