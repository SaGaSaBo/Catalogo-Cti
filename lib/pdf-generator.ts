import PDFDocument from 'pdfkit';

interface OrderItem {
  id?: string;
  title?: string;
  brand?: string;
  price?: number;
  sku?: string;
  size?: string | string[] | unknown;
  quantity?: number;
  total?: number;
  product?: {
    id?: string;
    title?: string;
    brand?: string;
    price?: number;
    sku?: string;
  };
  sizes?: Array<{ size?: string; talle?: string; label?: string; quantity?: number; qty?: number; price?: number; total?: number }>;
  sizeQuantities?: Record<string, number>;
}

interface OrderData {
  customer: { name: string; email: string; phone?: string };
  items: OrderItem[];
  total: number;
  date?: string;
}

/* Helpers seguros */
const S = (v: any, fb = '') => (v == null ? fb : String(v));
const N = (v: any, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};
const clip = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

/* Normaliza SIEMPRE a filas planas por talle */
function normalizeItems(rawItems: OrderItem[] = []) {
  const out: Array<{ id?: string; title: string; brand: string; sku: string; size: string; quantity: number; price: number; total: number }> = [];

  for (const it of rawItems) {
    // Sanitizar basura pesada
    // @ts-ignore
    delete (it as any).image; delete (it as any).images; delete (it as any).thumbnail;
    if (Array.isArray((it as any).imageUrls)) {
      (it as any).imageUrls = (it as any).imageUrls.filter((u: string) => /^https?:\/\//i.test(u));
    }

    const title = clip(S(it.title ?? it.product?.title ?? 'Sin título'), 50);
    const brand = clip(S(it.brand ?? it.product?.brand ?? 'Sin marca'), 30);
    const sku   = S(it.sku ?? it.product?.sku ?? 'Sin SKU');
    const basePrice = N(it.price ?? it.product?.price, 0);
    const baseQty   = N(it.quantity, 0);
    const baseSize  = (it as any).size ?? (it as any).talle ?? (it as any).label;

    // A) size string
    if (typeof baseSize === 'string') {
      const q = baseQty, p = basePrice, t = N(it.total, p * q);
      out.push({ id: it.id, title, brand, sku, size: baseSize || 'N/A', quantity: q, price: p, total: t });
      continue;
    }
    // B) size array de strings
    if (Array.isArray(baseSize) && baseSize.every(s => typeof s === 'string')) {
      for (const sz of baseSize) {
        const q = baseQty, p = basePrice, t = N(it.total, p * q);
        out.push({ id: it.id, title, brand, sku, size: S(sz, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }
    // C) sizes: [{ size|talle|label, quantity|qty, price?, total? }]
    if (Array.isArray(it.sizes) && it.sizes.length) {
      for (const s of it.sizes) {
        const sz = S(s.size ?? s.talle ?? s.label, 'N/A');
        const q = N(s.quantity ?? s.qty ?? baseQty, 0);
        const p = N(s.price ?? basePrice, 0);
        const t = N(s.total, p * q);
        out.push({ id: it.id, title, brand, sku, size: sz, quantity: q, price: p, total: t });
      }
      continue;
    }
    // D) sizeQuantities: { "S":2, "M":1 }
    if (it.sizeQuantities && typeof it.sizeQuantities === 'object') {
      for (const [szKey, qVal] of Object.entries(it.sizeQuantities)) {
        const q = N(qVal, 0), p = basePrice, t = p * q;
        out.push({ id: it.id, title, brand, sku, size: S(szKey, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }
    // Fallback
    {
      const q = baseQty, p = basePrice, t = N(it.total, p * q);
      out.push({ id: it.id, title, brand, sku, size: S(baseSize, 'N/A'), quantity: q, price: p, total: t });
    }
  }
  return out;
}

export async function createPDF(orderData: OrderData): Promise<Uint8Array> {
  const doc = new PDFDocument({ size: 'A4', margin: 24 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(new Uint8Array(buffer));
    });
    doc.on('error', reject);

    // ==== Encabezado de la orden ====
    doc.rect(0, 0, doc.page.width, 40).fill('#3B82F6');
    doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('ORDEN DE COMPRA', 24, 14);

    doc.fill('#000').fontSize(11).font('Helvetica-Bold').text('Información del Cliente', 24, 60);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Nombre: ${orderData.customer.name}`, 24, 78);
    doc.text(`Email: ${orderData.customer.email}`, 24, 92);
    if (orderData.customer.phone) doc.text(`Teléfono: ${orderData.customer.phone}`, 24, 106);
    const fecha = orderData.date || new Date().toISOString().slice(0, 10);
    doc.text(`Fecha: ${fecha}`, 24, 120);
    doc.moveTo(24, 130).lineTo(doc.page.width - 24, 130).strokeColor('#E5E7EB').stroke();

    // ==== Tabla ====
    const table = {
      x: 24,
      y: 145,
      w: doc.page.width - 48,  // ancho util
      bottom: doc.page.height - 72,
      col: {
        prod: 24,
        brand: 220,
        size: 350,
        qty: 400,
        price: 450,
        total: 520,
      },
      width: { prod: 180, brand: 120, size: 40, qty: 36, price: 60, total: 60 },
    };

    let y = table.y;

    const drawHeader = () => {
      doc.rect(table.x, y - 12, table.w, 18).fill('#3B82F6');
      doc.fill('#fff').font('Helvetica-Bold').fontSize(9);
      doc.text('Producto', table.col.prod, y - 10);
      doc.text('Marca',    table.col.brand, y - 10);
      doc.text('Talla',    table.col.size,  y - 10);
      doc.text('Cant.',    table.col.qty,   y - 10);
      doc.text('Precio',   table.col.price, y - 10);
      doc.text('Total',    table.col.total, y - 10);
      y += 14;
      doc.fill('#000').font('Helvetica').fontSize(9);
    };

    const newPage = () => {
      doc.addPage();
      y = 60;
      drawHeader();
    };

    drawHeader();

    const rows = normalizeItems(orderData.items);
    const rowHeight = 18;

    rows.forEach((it, idx) => {
      if (y + rowHeight > table.bottom) newPage();

      // Fila alternada
      if (idx % 2 === 0) {
        doc.save().rect(table.x, y - 2, table.w, rowHeight).fill('#F3F4F6').restore();
      }

      // Texto con ancho + ellipsis
      const title = it.title;
      const brand = it.brand;
      const size  = it.size;
      const qty   = it.quantity;
      const price = it.price;
      const total = Number.isFinite(it.total) ? it.total : price * qty;

      doc.fill('#000').font('Helvetica').fontSize(9);
      doc.text(title, table.col.prod,  y, { width: table.width.prod,  ellipsis: true });
      doc.text(brand, table.col.brand, y, { width: table.width.brand, ellipsis: true });
      doc.text(size,  table.col.size,  y, { width: table.width.size });
      doc.text(String(qty),             table.col.qty,   y, { width: table.width.qty,   align: 'right' });
      doc.text(`$${price.toLocaleString()}`, table.col.price, y, { width: table.width.price, align: 'right' });
      doc.text(`$${total.toLocaleString()}`, table.col.total, y, { width: table.width.total, align: 'right' });

      // SKU en gris (línea secundaria)
      doc.fontSize(7).fill('#6B7280');
      doc.text(`SKU: ${it.sku}`, table.col.prod, y + 8, { width: table.width.prod, ellipsis: true });

      // Restaurar
      doc.fontSize(9).fill('#000');

      y += rowHeight;
    });

    // ==== Total general ====
    const grandTotal =
      rows.reduce((a, r) => a + (Number.isFinite(r.total) ? r.total : r.price * r.quantity), 0) || orderData.total;

    if (y + 24 > table.bottom) newPage();
    y += 10;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`TOTAL: $${grandTotal.toLocaleString()}`, table.col.total - 50, y, { width: 110, align: 'right' });

    // Footer
    doc.font('Helvetica').fontSize(8).fill('#6B7280');
    doc.text('Gracias por su compra', 0, doc.page.height - 40, { align: 'center' });

    doc.end();
  });
}