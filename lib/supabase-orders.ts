import { supabase, SupabaseOrder } from './supabase';

/* ============================
   Config & Tipos
============================ */
const DEBUG = process.env.NODE_ENV !== 'production' && process.env.DEBUG_ORDERS === '1';
const ORDER_SCHEMA_VERSION = 1 as const;

// Estados permitidos (reutilizado en updateOrderStatus)
export type OrderStatus = 'recibido' | 'en_proceso' | 'entregado';

type AnyItem = Record<string, any>;
export type FlatItem = {
  id?: string;
  title: string;
  brand: string;
  sku: string;
  size: string;
  quantity: number;
  price: number;
  total: number; // subtotal por línea
};

export type CreateOrderInput = {
  customer: { name: string; email: string; phone?: string };
  items: AnyItem[];
  total: number; // total que viene del cliente (lo guardamos y también recalculamos)
};

type MinimalOrderData = {
  schemaVersion: number;
  customer: { name: string; email: string; phone: string | null };
  items: FlatItem[];
  total: number;           // total recibido del cliente
  computedTotal: number;   // total recalculado en server
  itemCount: number;
  createdAt: string;       // ISO
};

/* ============================
   Helpers seguros
============================ */
const S = (v: any, fb = ''): string => {
  try { return v == null ? fb : String(v); } catch { return fb; }
};
const N = (v: any, fb = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};
const clip = (s: string, max: number): string => (s.length > max ? s.slice(0, max - 1) + '…' : s);
const nowIso = () => new Date().toISOString();           // UTC
const isoForOrderNumber = () => nowIso().replace(/[-:TZ.]/g, '').slice(0, 14); // YYYYMMDDHHmmss

function generateOrderNumber(): string {
  const ts = isoForOrderNumber();
  const rand =
    (globalThis as any)?.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 8).toUpperCase() ??
    Math.random().toString(36).slice(2, 10).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

/* ============================
   Normalización por talle
============================ */
function sanitizeItemShape(it: AnyItem) {
  // Limpieza de posibles campos pesados (no guardamos blobs/base64)
  delete (it as any).image;
  delete (it as any).images;
  delete (it as any).thumbnail;
  if (Array.isArray((it as any).imageUrls)) {
    (it as any).imageUrls = (it as any).imageUrls.filter((u: string) => /^https?:\/\//i.test(u));
  }

  const title = clip(S(it.title ?? it.product?.title ?? 'Sin título'), 80);
  const brand = clip(S(it.brand ?? it.product?.brand ?? 'Sin marca'), 40);
  const sku   = S(it.sku ?? it.product?.sku ?? 'Sin SKU');
  const basePrice = N(it.price ?? it.product?.price, 0);
  const baseQuantity = N(it.quantity, 0);
  const baseSize = it.size ?? it.talle ?? it.label;

  return { title, brand, sku, basePrice, baseQuantity, baseSize, raw: it };
}

function flattenItems(items: AnyItem[]): FlatItem[] {
  const out: FlatItem[] = [];
  for (const it of items ?? []) {
    const { title, brand, sku, basePrice, baseQuantity, baseSize, raw } = sanitizeItemShape(it);

    // A) size string
    if (typeof baseSize === 'string') {
      const q = baseQuantity;
      const p = basePrice;
      const t = N(raw.total, p * q);
      out.push({ id: raw.id, title, brand, sku, size: baseSize || 'N/A', quantity: q, price: p, total: t });
      continue;
    }
    // B) size array de strings
    if (Array.isArray(baseSize) && baseSize.every(s => typeof s === 'string')) {
      for (const sz of baseSize) {
        const q = baseQuantity, p = basePrice, t = N(raw.total, p * q);
        out.push({ id: raw.id, title, brand, sku, size: S(sz, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }
    // C) sizes: [{ size|talle|label, quantity|qty, price?, total? }, ...]
    if (Array.isArray(raw.sizes) && raw.sizes.length) {
      for (const s of raw.sizes) {
        const sz = S(s.size ?? s.talle ?? s.label, 'N/A');
        const q = N(s.quantity ?? s.qty ?? baseQuantity, 0);
        const p = N(s.price ?? basePrice, 0);
        const t = N(s.total, p * q);
        out.push({ id: raw.id, title, brand, sku, size: sz, quantity: q, price: p, total: t });
      }
      continue;
    }
    // D) sizeQuantities: { "S": 2, "M": 1 }
    if (raw.sizeQuantities && typeof raw.sizeQuantities === 'object') {
      for (const [szKey, qVal] of Object.entries(raw.sizeQuantities)) {
        const q = N(qVal, 0), p = basePrice, t = p * q;
        out.push({ id: raw.id, title, brand, sku: sku, size: S(szKey, 'N/A'), quantity: q, price: p, total: t });
      }
      continue;
    }
    // Fallback (size desconocido)
    {
      const q = baseQuantity, p = basePrice, t = N(raw.total, p * q);
      out.push({ id: raw.id, title, brand, sku, size: S(baseSize, 'N/A'), quantity: q, price: p, total: t });
    }
  }
  return out;
}

// Merge por sku+size (reduce duplicados y estabiliza totales)
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

/* ============================
   API
============================ */
export async function createOrder(
  orderData: CreateOrderInput,
  _pdfBuffer?: Uint8Array // reservado por si más adelante guardás PDF en storage
): Promise<SupabaseOrder> {
  const orderNumber = generateOrderNumber();

  if (DEBUG) {
    const first = orderData.items[0] ? JSON.stringify(orderData.items[0]).slice(0, 600) : '—';
    console.log('🔄 Creando pedido:', orderNumber, '| ítems:', orderData.items.length, '| primer item:', first);
  }

  // 1) Normalizar y consolidar filas por talle
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

  // 2) Recalcular total en server (seguridad y consistencia)
  const computedTotal = flat.reduce(
    (acc, it) => acc + (Number.isFinite(it.total) ? it.total : it.price * it.quantity),
    0
  );

  // 3) Payload mínimo y estable para guardar
  const minimalOrderData: MinimalOrderData = {
    schemaVersion: ORDER_SCHEMA_VERSION,
    customer: {
      name: clip(S(orderData.customer.name), 80),
      email: clip(S(orderData.customer.email), 120),
      phone: orderData.customer.phone ? clip(S(orderData.customer.phone), 40) : null,
    },
    items: flat,
    total: N(orderData.total, 0),
    computedTotal,
    itemCount: flat.length,
    createdAt: nowIso(),
  };

  if (DEBUG) {
    console.log(
      '📊 OrderData listo',
      JSON.stringify(
        { itemCount: minimalOrderData.itemCount, total: minimalOrderData.total, computedTotal },
        null,
        2
      )
    );
  }

  // 4) Insert explícito (select columnas minimiza payload)
  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: minimalOrderData.customer.name,
      customer_email: minimalOrderData.customer.email,
      customer_phone: minimalOrderData.customer.phone,
      status: 'recibido' as OrderStatus,
      total_amount: minimalOrderData.total,
      order_data: minimalOrderData,
      pdf_data: null, // dejamos de guardar binarios en la tabla
    })
    .select(
      'id, created_at, order_number, customer_name, customer_email, customer_phone, status, total_amount, order_data'
    )
    .single();

  if (error) {
    if (DEBUG) console.error('❌ Error creando pedido:', error);
    throw new Error(error.message || 'Failed to create order');
  }

  if (DEBUG) console.log('✅ Pedido creado:', data?.id);
  return data as SupabaseOrder;
}

/**
 * Listado con paginación.
 * @param opts.limit cantidad (1..200)
 * @param opts.offset desplazamiento (0..)
 */
export async function getOrders(opts: { limit?: number; offset?: number } = {}): Promise<SupabaseOrder[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);

  if (DEBUG) console.log('🔍 getOrders', { limit, offset });

  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, order_number, customer_name, customer_email, customer_phone, status, total_amount')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    if (DEBUG) console.error('❌ Error listando pedidos:', error);
    throw new Error('Failed to fetch orders');
  }
  return data || [];
}

export async function getOrder(id: string): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  // PGRST116 = No rows
  // @ts-expect-error PostgREST error typing
  if (error?.code === 'PGRST116') return null;

  if (error) {
    if (DEBUG) console.error('❌ Error obteniendo pedido:', error);
    throw new Error('Failed to fetch order');
  }
  return data as SupabaseOrder;
}

// Búsqueda alternativa por número de pedido (útil p/ admin o links)
export async function getOrderByNumber(orderNumber: string): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  // @ts-expect-error PostgREST error typing
  if (error?.code === 'PGRST116') return null;

  if (error) {
    if (DEBUG) console.error('❌ Error obteniendo pedido por número:', error);
    throw new Error('Failed to fetch order');
  }
  return data as SupabaseOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<SupabaseOrder> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id, created_at, order_number, status')
    .single();

  if (error) {
    if (DEBUG) console.error('❌ Error actualizando estado:', error);
    throw new Error('Failed to update order status');
  }
  return data as SupabaseOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    if (DEBUG) console.error('❌ Error eliminando pedido:', error);
    throw new Error('Failed to delete order');
  }
}