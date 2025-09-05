import { supabase, SupabaseOrder } from './supabase';

const DEBUG = process.env.NODE_ENV !== 'production' && process.env.DEBUG_ORDERS === '1';

// Nº de pedido estable: YYYYMMDDHHmmss + sufijo aleatorio
function generateOrderNumber(): string {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const rand =
    (globalThis.crypto as any)?.randomUUID?.()
      ?.replace(/-/g, '')
      .slice(0, 8)
      .toUpperCase() ||
    Math.random().toString(36).slice(2, 10).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// ---- Normalización por talle ------------------------------------------------
// Acepta distintos formatos y devuelve siempre filas planas
type AnyItem = Record<string, any>;
type FlatItem = {
  id?: string;
  title: string;
  brand: string;
  sku: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
};

function str(v: any, fb = ''): string {
  try {
    if (v === null || v === undefined) return fb;
    return String(v);
  } catch {
    return fb;
  }
}
function num(v: any, fb = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}
function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function sanitizeItemShape(it: AnyItem): Omit<FlatItem, 'size' | 'quantity' | 'total'> & {
  baseSize: any;
  baseQuantity: number;
  basePrice: number;
} {
  // Limpieza de posibles campos pesados
  delete (it as any).image;
  delete (it as any).images;
  delete (it as any).thumbnail;
  if (Array.isArray((it as any).imageUrls)) {
    (it as any).imageUrls = (it as any).imageUrls.filter((u: string) => /^https?:\/\//i.test(u));
  }

  const title = clip(str(it.title ?? it.product?.title ?? 'Sin título'), 50);
  const brand = clip(str(it.brand ?? it.product?.brand ?? 'Sin marca'), 30);
  const sku = str(it.sku ?? it.product?.sku ?? 'Sin SKU');
  const basePrice = num(it.price ?? it.product?.price, 0);
  const baseQuantity = num(it.quantity, 0);
  const baseSize = it.size ?? it.talle ?? it.label;

  return { title, brand, sku, basePrice, baseQuantity, baseSize };
}

function flattenItems(items: AnyItem[]): FlatItem[] {
  const out: FlatItem[] = [];
  for (const raw of items ?? []) {
    const { title, brand, sku, basePrice, baseQuantity, baseSize } = sanitizeItemShape(raw);

    // Caso A: size string
    if (typeof baseSize === 'string') {
      const q = baseQuantity;
      const p = basePrice;
      const t = num(raw.total, p * q);
      out.push({ id: raw.id, title, brand, sku, size: baseSize || 'N/A', quantity: q, price: p, total: t });
      continue;
    }

    // Caso B: size array de strings
    if (Array.isArray(baseSize) && baseSize.every(s => typeof s === 'string')) {
      for (const sz of baseSize) {
        const q = baseQuantity;
        const p = basePrice;
        const t = num(raw.total, p * q);
        out.push({ id: raw.id, title, brand, sku, size: str(sz, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }

    // Caso C: sizes: [{ size|talle|label, quantity|qty, price?, total? }, ...]
    if (Array.isArray(raw.sizes) && raw.sizes.length) {
      for (const s of raw.sizes) {
        const sz = str(s.size ?? s.talle ?? s.label, 'N/A');
        const q = num(s.quantity ?? s.qty ?? baseQuantity, 0);
        const p = num(s.price ?? basePrice, 0);
        const t = num(s.total, p * q);
        out.push({ id: raw.id, title, brand, sku, size: sz, quantity: q, price: p, total: t });
      }
      continue;
    }

    // Caso D: sizeQuantities: { "S": 2, "M": 1 }
    if (raw.sizeQuantities && typeof raw.sizeQuantities === 'object') {
      for (const [szKey, qVal] of Object.entries(raw.sizeQuantities)) {
        const q = num(qVal, 0);
        const p = basePrice;
        const t = p * q;
        out.push({ id: raw.id, title, brand, sku, size: str(szKey, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }

    // Fallback
    {
      const q = baseQuantity;
      const p = basePrice;
      const t = num(raw.total, p * q);
      out.push({ id: raw.id, title, brand, sku, size: str(baseSize, 'N/A'), quantity: q, price: p, total: t });
    }
  }
  return out;
}

// (Opcional) fusiona líneas duplicadas por sku+size sumando cantidades
function mergeSameSkuSize(items: FlatItem[]): FlatItem[] {
  const map = new Map<string, FlatItem>();
  for (const it of items) {
    const key = `${it.sku}__${it.size}`;
    if (!map.has(key)) {
      map.set(key, { ...it });
    } else {
      const acc = map.get(key)!;
      acc.quantity += it.quantity;
      acc.total += it.total;
    }
  }
  return Array.from(map.values());
}

// ---- API --------------------------------------------------------------------

export async function createOrder(
  orderData: {
    customer: { name: string; email: string; phone?: string };
    items: AnyItem[]; // aceptamos estructuras varias
    total: number;
  },
  _pdfBuffer?: Uint8Array // no guardamos PDF en DB
): Promise<SupabaseOrder> {
  const orderNumber = generateOrderNumber();

  if (DEBUG) {
    const first = orderData.items[0] ? JSON.stringify(orderData.items[0]).slice(0, 800) : '—';
    console.log('🔄 Creando pedido:', orderNumber, 'items:', orderData.items.length, 'primer item:', first);
  }

  // Normalizar y sanear ítems
  const flat = mergeSameSkuSize(flattenItems(orderData.items)).map(it => ({
    id: it.id,
    title: it.title,
    brand: it.brand,
    sku: it.sku,
    size: it.size,
    quantity: it.quantity,
    price: it.price,
    total: it.total,
  }));

  // (Re)cálculo de total por seguridad
  const computedTotal = flat.reduce((acc, it) => acc + (Number.isFinite(it.total) ? it.total : it.price * it.quantity), 0);

  const minimalOrderData = {
    schemaVersion: 1,
    customer: {
      name: orderData.customer.name,
      email: orderData.customer.email,
      phone: orderData.customer.phone || null,
    },
    items: flat, // ya planos por talle
    total: orderData.total,
    computedTotal,
    itemCount: flat.length,
    createdAt: new Date().toISOString(),
  };

  if (DEBUG) {
    console.log('📊 Datos mínimos creados. items:', flat.length, 'total:', minimalOrderData.total, 'computedTotal:', computedTotal);
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone || null,
        status: 'recibido',
        total_amount: orderData.total,
        order_data: minimalOrderData,
        pdf_data: null, // No guardar PDF en la tabla
      })
      .select()
      .single();

    if (error) {
      if (DEBUG) console.error('❌ Error creating order:', error);
      throw new Error(error.message || 'Failed to create order');
    }

    if (DEBUG) console.log('✅ Pedido creado:', data.id);
    return data as SupabaseOrder;
  } catch (err) {
    if (DEBUG) console.error('❌ Error en createOrder:', err);
    throw err;
  }
}

export async function getOrders(): Promise<SupabaseOrder[]> {
  if (DEBUG) console.log('🔍 Consultando pedidos…');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (DEBUG) console.error('❌ Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
  return data || [];
}

export async function getOrder(id: string): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

  if (error) {
    // PGRST116 = No rows
    // @ts-expect-error: code existe en el objeto error de PostgREST
    if (error.code === 'PGRST116') return null;
    if (DEBUG) console.error('❌ Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
  return data as SupabaseOrder;
}

export async function updateOrderStatus(
  id: string,
  status: 'recibido' | 'en_proceso' | 'entregado'
): Promise<SupabaseOrder> {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) {
    if (DEBUG) console.error('❌ Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
  return data as SupabaseOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    if (DEBUG) console.error('❌ Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}